const closureCompiler = require('google-closure-compiler');
const closureCompilerUtils = require('google-closure-compiler/lib/utils.js');
const fsp = require('./fsp.js');
const path = require('path');
const tmp = require('tmp');

const CLOSURE_LIBRARY_PATH = 'node_modules/google-closure-library/closure/goog';
const EXTERNS = [
  'static/third_party/lib/web-animations/externs/web-animations.js',
  'static/third_party/lib/web-animations/externs/web-animations-next.js',
  'node_modules/google-closure-compiler/contrib/externs/maps/google_maps_api_v3_exp.js',
  'node_modules/google-closure-compiler/contrib/externs/jquery-3.3.js',
];


// https://github.com/google/closure-compiler/wiki/Warnings
const CLOSURE_WARNINGS = [
  'accessControls',
  'const',
  'visibility',
];

const CLOSURE_TYPESAFE_WARNINGS = CLOSURE_WARNINGS.concat([
  'checkTypes',
  'checkVars',
]);

const syntheticSourceRe = /\[synthetic:(.*?)\]/;


// nb. This assumes `compile-scene.js` is one level up from `node_modules`.
const rootDir = path.join(__dirname, '..');


/**
 * @typedef {{
 *   sceneName: string,
 *   typeSafe: (boolean|undefined),
 * }}
 */
var CompileSceneOptions;


/**
 * @param {!Array<string>} all Closure paths relative to the top-level of the project
 * @return {!Array<string>}
 */
function relativeSrc(all) {
  return all.map((p) => {
    const negate = (p[0] === '!');
    if (negate) {
      p = p.substr(1);
    }
    p = path.relative(rootDir, p)
    return (negate ? '!' : '') + p;
  });
}


/**
 * Process a raw source map, including adding source file contents. This is a tiny performance hit
 * and creates a HUGE source map, but it should only be served in dev.
 *
 * @param {!Buffer} buf raw sourceMap to process
 * @param {string} root path to apply to sourceMap
 * @return {!Object} updated sourceMap containing all source file contents
 */
async function processSourceMap(buf, root='../../') {
  const o = JSON.parse(buf.toString());
  o.sourceRoot = root;
  o.sourcesContent = [];
  for (let i = 0; i < o.sources.length; ++i) {
    const source = o.sources[i];

    // This is an ES6 synthetic source file for transpilation. Ignore it, but it still has to be
    // returned so the source map isn't confused.
    const m = syntheticSourceRe.exec(source);
    if (m) {
      o.sources[i] = '';
      o.sourcesContent.push('');
      continue;
    }

    const buf = await fsp.readFile(source, 'utf8');
    o.sourcesContent.push(buf);
  }
  return o;
}


/**
 * @param {!closureCompiler.compiler} compiler
 * @return {!Promise<string>}
 */
function invokeCompiler(compiler) {
  return new Promise((resolve, reject) => {
    const callback = (status, stdout, stderr) => {
      if (stderr.trim().length !== 0) {
        console.info(stderr);
      }
      status ? reject(status) : resolve(stdout);
    };
    compiler.run(callback);
  });
}


/**
 * Closure won't resolve symlinks in its source arguments. Scenes can specify additional
 * dependencies via symlinks, so resolve them.
 *
 * @param {string} sceneName
 * @return {!Array<string>}
 */
async function resolveCodeLinks(sceneName) {
  const root = path.join('static/scenes', sceneName, 'js');
  const all = await fsp.readdir(root);
  const out = [];

  for (const cand of all) {
    const target = path.join(root, cand);
    let link;
    try {
      link = await fsp.readlink(target);
    } catch (e) {
      continue;  // not a link
    }

    const resolved = path.join(root, link);
    const stat = await fsp.stat(resolved);
    if (stat.isDirectory()) {
      out.push(`${resolved}/**.js`);
    } else {
      out.push(resolved);
    }
  }

  return out;
}


/**
 * @param {!CompileSceneOptions} config
 * @param {boolean=} compile
 * @return {{compile: boolean, js: string, map: !Object}}
 */
module.exports = async function compile(config, compile=false) {
  const compilerSrc = [
    'build/transpile/export.js',
    'static/scenes/_shared/js/**.js',
    `static/scenes/${config.sceneName}/js/**.js`,
    '!**_test.js',
  ];
  compilerSrc.unshift(...(await resolveCodeLinks(config.sceneName)));

  // Scenes are compiled with Closure and then re-exported as modules. An export helper requires
  // `app.Game` and re-exports this (via string) onto `_globalExport`, which is defined in the
  // `outputWrapper` below. In some cases (no Closure library, not forced compile), this uses
  // 'WHITESPACE_ONLY' for much more rapid development.
  const containsClosureLibrary =
      (compilerSrc.findIndex((cand) => cand.startsWith(CLOSURE_LIBRARY_PATH)) !== -1);
  compile = compile || containsClosureLibrary;
  if (compile) {
    // If the Closure library wasn't requested, the compile still needs `base.js` for basic goog
    // methods like `goog.provide`.
    if (!containsClosureLibrary) {
      compilerSrc.unshift(`${CLOSURE_LIBRARY_PATH}/base.js`);
    }
  } else {
    // Adds simple $jscomp and goog.provide/goog.require methods for fast transpilation mode, which
    // declare globals suitable for execution in module scope.
    compilerSrc.unshift('build/transpile/base.js');
  }
  const outputWrapper =
      'var _globalExport;(function(){%output%}).call(self);export default _globalExport;';

  // Create a temporary place to store the source map. Closure can only write this to a real file.
  const sourceMapTemp = tmp.fileSync();

  const compilerFlags = {
    js: relativeSrc(compilerSrc),
    externs: relativeSrc(EXTERNS),
    create_source_map: sourceMapTemp.name,
    assume_function_wrapper: true,
    dependency_mode: 'STRICT',  // ignore all but exported via _globalExportEntry, below
    entry_point: '_globalExportEntry',
    compilation_level: compile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
    warning_level: config.typeSafe ? 'VERBOSE' : 'DEFAULT',
    language_in: 'ECMASCRIPT_2017',
    language_out: 'ECMASCRIPT5_STRICT',
    process_closure_primitives: true,
    jscomp_warning: config.typeSafe ? CLOSURE_TYPESAFE_WARNINGS : CLOSURE_WARNINGS,
    output_wrapper: outputWrapper,
    rewrite_polyfills: false,
  };
  console.info('compiling', compilerFlags);

  const compiler = new closureCompiler.compiler(compilerFlags);

  // Use any native image available, as this can be up to 10x (!) speed improvement on Java.
  const nativeImage = closureCompilerUtils.getNativeImagePath();
  if (nativeImage) {
    compiler.JAR_PATH = undefined;
    compiler.javaPath = nativeImage;
  }

  const js = await invokeCompiler(compiler);
  const map = await processSourceMap(await fsp.readFile(sourceMapTemp.name));
  sourceMapTemp.removeCallback();

  // nb. used so that listening callers can watch the whole dir for changes.
  map.sources.push(`static/scenes/${config.sceneName}/js`, `static/scenes/_shared/js`);
  map.sourcesContent.push(null, null);

  return {compile, js, map};
};
