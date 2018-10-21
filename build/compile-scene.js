const closureCompiler = require('google-closure-compiler');
const path = require('path');


const CLOSURE_LIBRARY_PATH = 'node_modules/google-closure-library/closure/goog';
const EXTERNS = [
  'third_party/lib/web-animations/externs/web-animations.js',
  'third_party/lib/web-animations/externs/web-animations-next.js',
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


/**
 * @typedef {{
 *   sceneName: string,
 *   entryPoint: (string|undefined),
 *   closureLibrary: (boolean|undefined),
 *   libraries: (!Array<string>|undefined),
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
    // nb. This assumes `compile-scene.js` is one level up from `node_modules`.
    p = path.join(__dirname, '..', p)
    return (negate ? '!' : '') + p;
  });
}


/**
 * @param {!CompileSceneOptions} config
 * @param {boolean=} compile
 * @return {{compile: boolean, js: string}} compiled output source
 */
module.exports = async function compile(config, compile=false) {
  const compilerSrc = [
    `scenes/${config.sceneName}/js/**.js`,
    'scenes/shared/js/*.js',
  ];
  const entryPoint = config.entryPoint || 'app.Game';

  // Extra closure compiled libraries required by scene. Unfortunately, Closure Compiler does not
  // support standard bash glob '**/*.ext', only '**.ext' which bash/gulp does not support.
  const libraries = (config.libraries || []).map((lib) => lib.replace('**/*', '**'));
  compilerSrc.push(...libraries);

  // Configure prefix and compilation options. In some cases (no libraries, not dist), we can
  // skip scene compilation for  more rapid development.
  let outputWrapper = `export default ${entryPoint};`;
  compile = compile || libraries.length || config.closureLibrary;
  if (compile) {
    compilerSrc.unshift(
      CLOSURE_LIBRARY_PATH + (config.closureLibrary ? '/**.js' : '/base.js'),
      `!${CLOSURE_LIBRARY_PATH}/**_test.js`,
    );
    // The compiled code needs a valid `this` to evaluate on (as there's no `this` when the built
    // code is run naïvely as a module), so calculate the left part of the entry point (e.g.
    // "app.Game" => "app") and delcare it as a global, as well as a property of the `this` during
    // execution of the Closure-generated source.
    const leftEntryPoint = entryPoint.split('.')[0];
    outputWrapper = `var global=window,$jscomp={global:global},${leftEntryPoint}={};
(function(){%output%}).call({${leftEntryPoint}});${outputWrapper}`;
  } else {
    // Adds simple $jscomp and goog.provide/goog.require methods for fast transpilation mode, which
    // declare globals suitable for execution in module scope. This is required as Closure's
    // built-in `goog.provide` doesn't play well when imported as a module.
    compilerSrc.unshift('build/transpile/base.js');
    outputWrapper = `%output%;${outputWrapper}`;
  }

  const compilerFlags = {
    js: relativeSrc(compilerSrc),
    externs: relativeSrc(EXTERNS),
    assume_function_wrapper: true,
    dependency_mode: 'STRICT',  // ignore all but exported via entryPoint
    entry_point: entryPoint,
    compilation_level: compile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
    warning_level: config.typeSafe ? 'VERBOSE' : 'DEFAULT',
    language_in: 'ECMASCRIPT6_STRICT',
    language_out: 'ECMASCRIPT5_STRICT',
    process_closure_primitives: null,
    generate_exports: null,
    jscomp_warning: config.typeSafe ? CLOSURE_TYPESAFE_WARNINGS : CLOSURE_WARNINGS,
    rewrite_polyfills: false,  // provided by external polyfills
    output_wrapper: outputWrapper,
  };

  const compiler = new closureCompiler.compiler(compilerFlags);
  const js = await new Promise((resolve, reject) => {
    const callback = (status, stdout, stderr) => {
      if (stderr.trim().length !== 0) {
        console.info(stderr);
      }
      status ? reject(status) : resolve(stdout);
    };

    const args = [callback];
    if (compiler instanceof closureCompiler.jsCompiler) {
      // TODO(samthor): Expand Closure-style globs and prepend files as array to args.
      throw new TypeError('Closure jsCompiler currently unsupported');
    }
    compiler.run.apply(compiler, args);
  });

  return {js, compile};
};
