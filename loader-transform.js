const fs = require('fs');
const mimeTypes = require('mime-types');
const path = require('path');


const watchTimeout = 30 * 1000;


/**
 * @param {string} filename of the target file
 * @param {string} content to inline within
 * @param {!Object} map to inline
 * @return {string} a possibly-modified content
 */
function inlineSourceMap(filename, content, map) {
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

  // assume node_modules/ content will not change
  const valid = paths.filter((cand) => cand && !cand.startsWith('node_modules/'));
  if (!valid.length) {
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

  return setTimeout(shutdown, timeout);
}


/**
 * @param {function(string): ?Object} loader to load file from disk or build it
 * @param {string} filename to be loaded
 * @param {function(): void} cleanup to be called once file is done or cannot be loaded
 * @return {?string}
 */
async function load(loader, filename, cleanup) {
  let watching = false;

  try {
    const raw = await loader(filename);
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
 * Builds a Koa transform which wraps the given Loader.
 *
 * @param {function(string): ?Object} loader to load file from disk or build it
 */
module.exports = function(loader) {
  const cached = {};

  return async (ctx, next) => {
    let filename = ctx.path.substr(1);
    if (filename.endsWith('/') || filename === '') {
      filename += 'index.html';
    }

    let p = cached[filename];
    if (p === undefined) {
      // there was no cached result: fetch one, and delete it on cleanup (or if we can't retain
      // the result, e.g., nothing sane can be watched)
      p = load(loader, filename, () => delete cached[filename]);
      cached[filename] = p;
    }

    const result = await p;
    if (result === null) {
      return next();
    }

    ctx.response.body = result;
    ctx.response.type = mimeTypes.lookup(filename) || ctx.response.type;
  };
};