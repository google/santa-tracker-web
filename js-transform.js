const babelCore = require('@babel/core');
const babylon = require('babylon');
const fsp = require('./build/fsp.js');
const path = require('path');
const rollupEntrypoint = require('./build/rollup-entrypoint.js');

const buildInlineJsHelpers = require('./build/babel/inline-js-helpers.js');
const buildResolveBareSpecifiers = require('./build/babel/resolve-bare-specifiers.js');

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
  const filename = path.join(process.cwd(), ctx.path);
  let js;
  if ('rollup' in ctx.query) {
    js = await rollupEntrypoint(filename);
  } else {
    js = await fsp.readFile(filename, 'utf8');
  }

  let ast;
  try {
    ast = babylon.parse(js, {
      sourceType: 'module',
      plugins: [
        'asyncGenerators',
        'objectRestSpread',
      ],
    });
  } catch (e) {
    if (e.constructor.name === 'SyntaxError') {
      console.error('ERROR: failed to parse JavaScript', e);
      return next();
    } else {
      throw e;
    }
  }

  const messageLookup = (key) => {
    const object = messages[key];
    return object && (object.raw || object.message) || null;
  };
  const inlineJsHelpers = buildInlineJsHelpers(messageLookup)

  const plugins = [
    buildResolveBareSpecifiers(),
    inlineJsHelpers.plugin,
  ];
  const result = babelCore.transformFromAst(ast, js, {presets: [], plugins});
  ctx.response.type = 'text/javascript';
  ctx.response.body = result.code;
};
