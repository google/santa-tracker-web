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
 *   entryPoint: (string|undefined),
 *   closureLibrary: (boolean|undefined),
 *   libraries: (!Array<string>|undefined),
 *   es2015: (boolean|undefined),
 *   typeSafe: (boolean|undefined),
 * }} config
 * @param {boolean=} compile
 * @return {string} compiled output source
 */
module.exports = async function compile(config, compile=false) {
  const compilerSrc = [
    `scenes/${config.sceneName}/js/**.js`,
    'scenes/shared/js/*.js',
  ];

  // All scenes need base.js to get support for 'goog.' builtins, but some need the entire library.
  compilerSrc.push(
    CLOSURE_LIBRARY_PATH + (config.closureLibrary ? '/**.js' : '/base.js'),
    `!${CLOSURE_LIBRARY_PATH}/**_test.js`,
  );

  // Extra closure compiled libraries required by scene. Unfortunately, Closure Compiler does not
  // support standard bash glob '**/*.ext', only '**.ext' which bash/gulp does not support.
  const libraries = (config.libraries || []).map((lib) => lib.replace('**/*', '**'));
  compilerSrc.push(...libraries);

  // Configure prefix and compilation options. In some cases (no libraries, not dist), we can
  // skip scene compilation for  more rapid development.
  let prefixCode = `var global=window,app=this.app,$jscomp=this['$jscomp']={global:global};`;
  compile = compile || libraries.length || config.closureLibrary || config.es2015;
  if (!compile) {
    // Add simple $jscomp methods needed for ES6 => ES5 transpilation.
    // (Most $jscomp helpers are added as part of --rewrite_polyfills, which we don't use, but
    // ES6 class transpilation is special.)
    prefixCode += `$jscomp.inherits = function(c, p) {
  c.prototype = Object.create(p.prototype);
  c.prototype.constructor = c;
  Object.setPrototypeOf(c, p);
};`.replace(/\s+/g, '');;
  }

  const compilerFlags = {
    js: relativeSrc(compilerSrc),
    externs: relativeSrc(EXTERNS),
    assume_function_wrapper: true,
    closure_entry_point: config.entryPoint || '',
    only_closure_dependencies: null,
    compilation_level: compile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
    warning_level: 'VERBOSE',
    language_in: 'ECMASCRIPT6_STRICT',
    language_out: 'ECMASCRIPT5_STRICT',
    process_closure_primitives: null,
    generate_exports: null,
    jscomp_warning: config.typeSafe ? CLOSURE_MORE_WARNINGS : CLOSURE_WARNINGS,
    rewrite_polyfills: false,
    output_wrapper: `(function(){${prefixCode}%output%})();`,
  };

  const compiler = new closureCompiler.compiler(compilerFlags);
  return await new Promise((resolve, reject) => {
    const process = compiler.run((status, stdout, stderr) => {
      console.info(stderr);
      if (status) {
        return reject(status);
      }
      resolve(stdout);
    });
  });
};
