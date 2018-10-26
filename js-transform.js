const compileCss = require('./build/compile-css.js');
const fsp = require('./build/fsp.js');
const normalizeJs = require('./build/normalize-js.js');
const path = require('path');
const rollupEntrypoint = require('./build/rollup-entrypoint.js');
const sass = require('sass');

const messages = require('./en_src_messages.json');

module.exports = async (ctx, next) => {
  const ext = path.extname(ctx.path);
  if (!['.js', '.mjs'].includes(ext) ||
      ctx.path.startsWith('/third_party/') ||
      ctx.path.endsWith('.min.js')) {
    return next();
  }

  // Retrieve JS, optionally invoking Rollup (needed for Worker code, which doesn't support modules
  // in late 2018).
  const filename = ctx.path.substr(1);
  let js;
  if ('rollup' in ctx.query) {
    js = await rollupEntrypoint(filename);
  } else {
    js = await fsp.readFile(filename, 'utf8');
  }

  // Rewrites found template literals with specific names. Needed for build-time messages and CSS.
  const inlineHandler = (name, arg) => {
    switch (name) {
      case '_msg': {
        const object = messages[arg];
        return object && (object.raw || object.message) || '?';
      }
      case '_style': {
        return compileCss(`styles/${arg}.scss`);
      }
    }
  };

  ctx.response.type = 'text/javascript';
  ctx.response.body = normalizeJs(filename, js, inlineHandler);
};
