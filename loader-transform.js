const fs = require('fs');
const mimeTypes = require('mime-types');
const path = require('path');

const watchTimeout = 30 * 1000;

// FIXME FIXME remove this and just steal the caching work

/**
 * @param {string} filename of the target file
 * @param {string} content to inline within
 * @param {?Object} map to inline
 * @return {string} a possibly-modified content
 */
function inlineSourceMap(filename, content, map) {
  if (!map) {
    return content;
  }
  const ext = path.extname(filename);

  let cstyle;
  if (ext === '.js') {
    cstyle = false;
  } else if (ext === '.css') {
    cstyle = true;
  } else {
    return content;
  }

  const encodedMap = Buffer.from(JSON.stringify(map), 'utf8').toString('base64');
  const trailer = `# sourceMappingURL=data:application/json;base64,${encodedMap}`;
  if (cstyle) {
    return content + `\n/*${trailer} */`;
  }
  return content + `\n//${trailer}`;
}


/**
 * @param {?Array<string>} paths to watch
 * @param {function(): void} done to call if something triggered the watch
 * @param {number} timeout when to expire the watch
 * @return {?number} the ID of the setTimeout, or null if none
 */
function watch(paths, done, timeout) {
  if (!paths) {
    return null;
  }

  // TODO(samthor): Maybe update this if we ever move all static into static/.
  const validWatchPrefix = [
    'src/', 'scenes/', 'styles/', 'index.html',
  ];

  // assume non-src/scene content will not change
  const valid = paths.filter((cand) => {
    if (cand) {
      for (const prefix of validWatchPrefix) {
        if (cand.startsWith(prefix)) {
          return true;
        }
      }
    }
    return false;
  });
  if (!valid.length) {
//    console.info('bailing, could not find any valid', paths);
    return null;
  }

  let watchers;
  const shutdown = () => {
    watchers.forEach((watcher) => watcher.close());
    done();
  }
  // TODO(samthor): {recursive: true} doesn't work on Linux, but this method is passed all
  // dependant files anyway. This will only cause problems for scenes, which build whole dirs, but
  // observing the directory reveals immediate subtree changes regardless.
  watchers = valid.map((cand) => fs.watch(cand, {recursive: true}, shutdown));
  console.info('got valid files to watch', valid);

  return setTimeout(shutdown, timeout);
}


/**
 * @param {function(string): ?Object} loader to load file from disk or build it
 * @param {string} filename to be loaded
 * @param {function(): void} cleanup to be called once file is done or cannot be loaded
 * @return {?string}
 */
async function load(loader, filename, isModuleImport, cleanup) {
  let watching = false;

  try {
    const raw = await loader(filename, isModuleImport);
    if (!raw) {
      // nothing to do, defer to static handler
      return null;
    } else if (!raw.map) {
      // bail early if there's no source map, nothing to watch/append
      return raw.body;
    }

    // Invalidate cache if something observable changes. Note that this does not incorporate
    // sourceRoot, as it describes the path from the sources to the request path root.
    watching = watch(raw.map.sources, cleanup, watchTimeout);

    // append the encoded source map if possible
    return inlineSourceMap(filename, raw.body, raw.map);

  } finally {
    // run cleanup early if it won't be run by watch
    watching || cleanup();
  }

  throw new Error('should not get here');
}


/**
 * Builds asynchronous HTTP middleware which wraps the given Loader.
 *
 * @param {function(string): ?Object} loader to load file from disk or build it
 */
module.exports = function(loader) {
  const cached = {};

  return async (req, res, next) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',  // always CORS enabled
    };

    let filename = req.path.substr(1);
    if (filename.endsWith('/') || filename === '') {
      filename += 'index.html';
    }

    // Santa Tracker can serve various different files during dev.
    //   1. JS rewritten in module mode, to resolve Node imports
    //   2. CSS/JSON/? rewritten to JS in module mode, to polyfill an "import" for that type
    //   3. Files sourced from Santa's Virtual File System (e.g. .sass => .css)
    //   4. Real, unmodified files
    //
    // If the request has an Origin header, this is a fetch for `type="module"`, aka module mode.
    // This is a BIG LEAP and might not always be true, but it works for dev in modern evergreens.

    const isModuleMode = Boolean(req.headers['origin']);

    let p = cached[filename];
    if (p === undefined) {
      // there was no cached result: fetch one, and delete it on cleanup (or if we can't retain
      // the result, e.g., nothing sane can be watched)
      p = load(loader, filename, isModuleMode, () => delete cached[filename]);
      cached[filename] = p;
    }

    let result;
    try {
      result = await p;
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        res.writeHead(404);
      } else {
        console.warn(filename, e);
        res.writeHead(500);
      }
      return res.end();
    }

    if (result === null) {
      return next();
    }

    if (isModuleMode) {
      headers['Content-Type'] = 'application/javascript';
    } else {
      const mimeType = mimeTypes.lookup(filename);
      if (mimeType) {
        headers['Content-Type'] = mimeType;
      }
    }

    res.writeHead(200, headers);
    res.end(result);
  };
};