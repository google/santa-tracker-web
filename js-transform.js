const babelCore = require('@babel/core');
const babylon = require('babylon');
const fsp = require('./build/fsp.js');
const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupInject = require('rollup-plugin-inject');

const buildUpgradeHTMLDeps = require('./build/babel/upgrade-html-deps.js');
const buildResolveBareSpecifiers = require('./build/babel/resolve-bare-specifiers.js');

const rollupInputOptions = filename => ({
  input: filename,
  plugins: [
    rollupNodeResolve(),
    // NOTE(cdata): This is only necessary to support redux until
    // https://github.com/reduxjs/redux/pull/3143 lands in a release
    rollupInject({
      include: 'node_modules/redux/**/*.js',
      modules: {process: path.resolve('./src/lib/process.js')},
    }),
  ],
});

const rollupOutputOptions = filename => ({name: filename, format: 'umd'});

module.exports = async (ctx, next) => {
  const ext = path.extname(ctx.path);
  if (!['.js', '.mjs'].includes(ext) || ctx.path.startsWith('/third_party/') || ctx.path.endsWith('.min.js')) {
    return next();
  }

  const filename = path.join(process.cwd(), ctx.path);
  let js = null;

  if ('rollup' in ctx.query) {
    try {
      const bundle = await rollup.rollup(rollupInputOptions(filename));
      const {code} = await bundle.generate(rollupOutputOptions(filename));
      js = code;
    } catch (e) {
      console.error(`ERROR: Rollup failed on ${ctx.path}`, e);
    }
  }
  if (!js) {
    js = await fsp.readFile(filename, 'utf8');
  }

  const presets = [];
  const plugins = [];

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

  plugins.push(buildResolveBareSpecifiers());
  plugins.push(buildUpgradeHTMLDeps());

  const result = babelCore.transformFromAst(ast, js, {presets, plugins});
  ctx.response.type = 'text/javascript';
  ctx.response.body = result.code;
};
