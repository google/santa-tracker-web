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

const CLOSURE_MORE_WARNINGS = CLOSURE_WARNINGS.concat([
  'checkTypes',
  'checkVars',
]);


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
    p = path.join(__dirname, '..', p)
    return (negate ? '!' : '') + p;
  })
}


/**
 * @param {{
 *   sceneName: string,
 *   entryPoint: string,
 *   closureLibrary: (boolean|undefined),
 *   libraries: (!Array<string>|undefined),
 *   es2015: (boolean|undefined),
 *   typeSafe: (boolean|undefined),
 * }} config
 * @param {boolean=} compile
 * @return {{compile: boolean, js: string}} compiled output source
 */
module.exports = async function compile(config, compile=false) {
  const compilerSrc = [
    `scenes/${config.sceneName}/js/**.js`,
    'scenes/shared/js/*.js',
  ];

  // TODO(samthor): This does not deal with ES2015 'file' entry points right now.
  if (config.entryPoint.indexOf('/') !== -1 || config.entryPoint.endsWith('.js')) {
    throw new TypeError('ES2015 entryPoint unsupported: ' + config.entryPoint);
  }

  // Extra closure compiled libraries required by scene. Unfortunately, Closure Compiler does not
  // support standard bash glob '**/*.ext', only '**.ext' which bash/gulp does not support.
  const libraries = (config.libraries || []).map((lib) => lib.replace('**/*', '**'));
  compilerSrc.push(...libraries);

  // Configure prefix and compilation options. In some cases (no libraries, not dist), we can
  // skip scene compilation for  more rapid development.
  let outputWrapper = `export default ${config.entryPoint};`;
  compile = compile || libraries.length || config.closureLibrary || config.es2015;
  if (compile) {
    compilerSrc.unshift(
      CLOSURE_LIBRARY_PATH + (config.closureLibrary ? '/**.js' : '/base.js'),
      `!${CLOSURE_LIBRARY_PATH}/**_test.js`,
    );
    // We need to provide the compiled code a valid 'this' scope to evaluate on (as there's no
    // this when we run the code naively in a module). The 'this' must declare the left part of
    // the entry point (e.g. "app.Game" => "app"), so the internal Closure code can write to it.
    const leftEntryPoint = config.entryPoint.split('.')[0];
    outputWrapper = `
var global=window,
$jscomp={global:global},
${leftEntryPoint}={};
(function(){%output%}).call({${leftEntryPoint}});` + outputWrapper;
  } else {
    // Adds simple $jscomp and goog.provide/goog.require methods for fast transpilation mode. We
    // need to provide our own code as Closure's built-in `goog.provide` doesn't play well when
    // imported as a module.
    compilerSrc.unshift('build/transpile/base.js');
    outputWrapper = `%output%;` + outputWrapper;
  }

  const compilerFlags = {
    js: relativeSrc(compilerSrc),
    externs: relativeSrc(EXTERNS),
    assume_function_wrapper: true,
    closure_entry_point: config.entryPoint || '',
    only_closure_dependencies: null,
    compilation_level: compile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
    warning_level: config.typeSafe ? 'VERBOSE' : 'DEFAULT',
    language_in: 'ECMASCRIPT6_STRICT',
    language_out: 'ECMASCRIPT5_STRICT',
    process_closure_primitives: null,
    generate_exports: null,
    jscomp_warning: config.typeSafe ? CLOSURE_MORE_WARNINGS : CLOSURE_WARNINGS,
    rewrite_polyfills: false,
    output_wrapper: outputWrapper,
    rename_prefix_namespace: 'test',
  };

  const compiler = new closureCompiler.compiler(compilerFlags);
  const js = await new Promise((resolve, reject) => {
    const process = compiler.run((status, stdout, stderr) => {
      if (stderr.trim().length) {
        console.info(stderr);
      }
      if (status) {
        return reject(status);
      }
      resolve(stdout);
    });
  });

  return {js, compile};
};
