const fs = require('fs');
const path = require('path');


const watchTimeout = 30 * 1000;


/**
 * @param {string} filename to return defs for
 * @return {{type: ?string, cstyle: (boolean|undefined)}}
 */
function defs(filename) {
  switch (path.extname(filename)) {
    case '.js':
      return {type: 'application/javascript', cstyle: false};
    case '.css':
      return {type: 'text/css', cstyle: true};
    default:
      return {type: null, cstyle: undefined};
  }
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

  const valid = paths.filter((cand) => !cand.startsWith('node_modules/'));
  if (!valid.length) {
    return null;
  }

  let watchers;
  const shutdown = () => {
    watchers.forEach((watcher) => watcher.close());
    done();
  }
  // TODO(samthor): {recursive: true} doesn't work on Linux, but this method is passed all
  // dependant files. This will only cause problems for scenes, which build whole dirs.
  watchers = paths.map((cand) => fs.watch(cand, {recursive: true}, shutdown));

  return setTimeout(shutdown, timeout);
}


/**
 * @param {function(string): ?Object} loader to load file from disk or build it
 * @param {string} filename to be loaded
 * @param {function(): void} cleanup to be called once file is done or cannot be loaded
 * @return {?{body: string, type: ?string}}
 */
async function load(loader, filename, cleanup) {
  const result = {
    body: null,
    type: null,
  };
  let watching = false;

  try {
    const raw = await loader(filename);
    if (!raw) {
      return null;
    }

    const {type, cstyle} = defs(filename);
    result.body = raw.body;
    result.type = type;

    // bail early if there's no source map, nothing to watch/append
    if (!raw.map) {
      return result;
    }

    // append the encoded source map if possible
    if (typeof cstyle === 'boolean') {
      const encodedMap = Buffer.from(JSON.stringify(raw.map), 'utf8').toString('base64');
      const trailer = `# sourceMappingURL=data:application/json;base64,${encodedMap}`;
      if (cstyle) {
        result.body += `/*${trailer} */`;
      } else {
        result.body += `//${trailer}`;
      }
    }

    // invalidate cache if something observable changes
    watching = watch(raw.map.sources, cleanup, watchTimeout);
    return result;
  } finally {
    // run cleanup early if it won't be run by watch
    watching || cleanup();
  }

  throw new Error('should not get here');
}


/**
 * Builds a Koa transform which wraps the given Loader.
 */
module.exports = function(loader) {
  const cached = {};

  return async (ctx, next) => {
    const filename = ctx.path.substr(1);

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

    ctx.response.body = result.body;
    if (result.type !== null) {
      ctx.response.type = result.type;
    }
  };
};