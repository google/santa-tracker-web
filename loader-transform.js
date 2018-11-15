const fs = require('fs');
const path = require('path');


const watchTimeout = 15 * 1000;


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
 * Builds a Koa transform which wraps the given Loader.
 */
module.exports = function(loader) {
  const cached = {};

  function prepare(filename, out) {
    const {type, cstyle} = defs(filename);
    const result = {body: out.body, type};

    if (out.map) {
      // invalidate cache if something observable changes
      const cleanup = () => delete cached[filename];
      if (watch(out.map.sources, cleanup, watchTimeout)) {
        cached[filename] = result;
      }

      // append the encoded sourceMap
      if (typeof cstyle === 'boolean') {
        const encodedMap = Buffer.from(JSON.stringify(out.map), 'utf8').toString('base64');
        const trailer = `# sourceMappingURL=data:application/json;base64,${encodedMap}`;
        if (cstyle) {
          result.body += `/*${trailer} */`;
        } else {
          result.body += `//${trailer}`;
        }
      }
    }

    return result;
  }

  return async (ctx, next) => {
    const filename = ctx.path.substr(1);

    let result = cached[filename];
    if (result === undefined) {
      // nothing cached, call the actual loader
      const out = await loader(filename);
      if (out === null) {
        return next();
      }
      result = prepare(filename, out);
    }

    ctx.response.body = result.body;
    if (result.type !== null) {
      ctx.response.type = result.type;
    }
  };
};