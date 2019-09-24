const closureCompiler = require('google-closure-compiler');
const closureCompilerUtils = require('google-closure-compiler/lib/utils.js');
const fs = require('fs').promises;
const path = require('path');
const tmp = require('tmp');

const CLOSURE_LIBRARY_PATH = 'static/node_modules/google-closure-library/closure/goog/';
const EXTERNS = [
  'build/transpile/magic-externs.js',
  'static/third_party/lib/web-animations/externs/web-animations.js',
  'static/third_party/lib/web-animations/externs/web-animations-next.js',
  'static/node_modules/google-closure-compiler/contrib/externs/maps/google_maps_api_v3_exp.js',
  'static/node_modules/google-closure-compiler/contrib/externs/jquery-3.3.js',
];


// https://github.com/google/closure-compiler/wiki/Warnings
const CLOSURE_WARNINGS = [
  'accessControls',
  'checkDebuggerStatement',
  'checkRegExp',
  'checkTypes',
  'checkVars',
  'closureDepMethodUsageChecks',
  'const',
  'deprecatedAnnotations',
  'missingProperties',
  'missingReturn',
  'strictModuleDepCheck',
  'typeInvalidation',
  'undefinedNames',
  'undefinedVars',
  'useOfGoogBase',
  'visibility',

// Lots of old Closure scenes include things for global, leaky, side-effects.
//  'extraRequire',
];

const syntheticSourceRe = /\[synthetic:(.*?)\]/;


// nb. This assumes `compile-scene.js` is one level up from `node_modules`.
const rootDir = path.join(__dirname, '..');


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

    const buf = await fs.readFile(source, 'utf8');
    o.sourcesContent.push(buf);
  }
  return o;
}


/**
 * @param {!closureCompiler.compiler} compiler
 * @param {function(string): void} callback for stderr
 * @return {!Promise<string>}
 */
function invokeCompiler(compiler, callback) {
  return new Promise((resolve, reject) => {
    const compilerCallback = (status, stdout, stderr) => {
      if (stderr.trim().length !== 0) {
        callback(stderr);
      }
      status ? reject(status) : resolve(stdout);
    };
    compiler.run(compilerCallback);
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
  const all = await fs.readdir(root);
  const out = [];

  for (const cand of all) {
    const target = path.join(root, cand);
    let link;
    try {
      link = await fs.readlink(target);
    } catch (e) {
      continue;  // not a link
    }

    const resolved = path.join(root, link);
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      out.push(`${resolved}/**.js`);
    } else {
      out.push(resolved);
    }
  }

  return out;
}


/**
 * @param {string} sceneName
 * @param {boolean=} compile
 * @return {{compile: boolean, js: string, map: !Object}}
 */
module.exports = async function compile(sceneName, compile=false) {
  const compilerSrc = [
    'build/transpile/export.js',
    'static/scenes/_shared/js/**.js',
    `static/scenes/${sceneName}/js/**.js`,
    '!**_test.js',
  ];
  compilerSrc.unshift(...(await resolveCodeLinks(sceneName)));

  // Scenes are compiled with Closure and then re-exported as modules. An export helper requires
  // `app.Game` and re-exports this (via string) onto `_globalExport`, which is defined in the
  // `outputWrapper` below. In some cases (no Closure library, not forced compile), this uses
  // 'WHITESPACE_ONLY' for much more rapid development.
  const containsClosureLibrary =
      (compilerSrc.findIndex((cand) => cand.startsWith(CLOSURE_LIBRARY_PATH)) !== -1);
  compile = compile || containsClosureLibrary;
  if (containsClosureLibrary) {
    // Closure's library is quite large and includes bad behavior like eval() to check for Safari
    // bugs and to load further module code (!?!). It would be properly treeshaken in
    // ADVANCED_OPTIMIZATIONS mode but no scenes reliably work in this way.
  } else {
    // Adds simple $jscomp and goog.provide/goog.require methods, rather than Closure's base.
    compilerSrc.unshift('build/transpile/base.js');
  }

  // Import `_msg` and `_static` helpers from our magic script. This lets scenes interact with their
  // environment (although Rollup will complain that they're not used).
  const outputWrapper =
      'import {_msg, _static} from \'../../src/magic.js\';' +
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
    warning_level: 'VERBOSE',
    language_in: 'ECMASCRIPT_2017',
    language_out: 'ECMASCRIPT6_STRICT',  // nb. need 6+, for i18n template literals compiled later
    process_closure_primitives: true,
    jscomp_warning: CLOSURE_WARNINGS,
    output_wrapper: outputWrapper,
    rewrite_polyfills: false,
    inject_libraries: containsClosureLibrary,  // this injects "$jscomp" for base.js which needs it
    use_types_for_optimization: true,
  };

  try {
    const compiler = new closureCompiler.compiler(compilerFlags);

    // Use any native image available, as this can be up to 10x (!) speed improvement on Java.
    const nativeImage = closureCompilerUtils.getNativeImagePath();
    if (nativeImage) {
      compiler.JAR_PATH = undefined;
      compiler.javaPath = nativeImage;
    }

    let errors = false;
    const js = await invokeCompiler(compiler, (stderr) => {
      // TODO:pass to caller.
      console.warn(`# ${sceneName}`)
      console.warn(stderr);
      errors = true;
    });
    const map = await processSourceMap(await fs.readFile(sourceMapTemp.name));

    // nb. used so that listening callers can watch the whole dir for changes.
    map.sources.push(`static/scenes/${sceneName}/js`, `static/scenes/_shared/js`);
    map.sourcesContent.push(null, null);

    return {compile, js, map};
  } finally {
    sourceMapTemp.removeCallback();
  }
};
