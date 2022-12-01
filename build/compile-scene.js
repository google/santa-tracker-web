/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const closureCompiler = require('google-closure-compiler');
const closureCompilerUtils = require('google-closure-compiler/lib/utils.js');
const fs = require('fs').promises;
const tmp = require('tmp');

const EXTERNS = [
  'build/transpile/magic-externs.js',
  'node_modules/google-closure-compiler/contrib/externs/maps/google_maps_api_v3_exp.js',
  'node_modules/google-closure-compiler/contrib/externs/jquery-3.3.js',
];

const CLOSURE_DISABLE_WARNINGS = [
  // Causes complaints about misordered goog.require().
  'underscore',

  // Lots of library code generates unused vars.
  'unusedLocalVariables',

  // This includes checks for: missing semicolons, missing ? or ! on object types, etc.
  // This would be a lot of work to resolve.
  'lintChecks',

  // These have to do with goog.require()/goog.provide() and how we "leak" some objects (such as
  // Constants, LevelUp, etc). These could be fixed up.
  'missingSourcesWarnings',
  'extraRequire',
  'missingProvide',
  'strictMissingRequire',
  'missingRequire',
];

const syntheticSourceRe = /\[synthetic:(.*?)\]/;


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
 * @return {!Promise<string>}
 */
function invokeCompiler(compiler) {
  return new Promise((resolve) => {
    const compilerCallback = (status, stdout, stderr) => {
      resolve({status, code: stdout, log: stderr});
    };
    compiler.run(compilerCallback);
  });
}


/**
 * @param {string} sceneName
 * @param {boolean=} compile
 * @return {{code: string, map: !Object}}
 */
module.exports = async function compile(sceneName, compile=true) {
  const compilerSrc = [
    'build/transpile/export.js',
    'static/scenes/_shared/js',
    `static/scenes/${sceneName}/js`,
    '!**_test.js',
  ];

  // Scenes that require the Closure Library need to be compiled (and will fail if compile is
  // false). For others, we can provide a quick fake base.js that includes basic polyfills for
  // goog.require()/goog.provide() and friends.
  if (!compile) {
    compilerSrc.unshift('build/transpile/base.js');
  }

  // This function works by compiling scenes with Closure and then re-exporting them as ES modules.
  // We expect `app.Game` to be provided (see build/transpile.export.js), and place it on the var
  // `_globalExport` (see below).
  // Additionally, import `_msg` and `_static` from our magic script. This lets scenes interact
  // with their environment (although Rollup will complain if they're not used).
  const outputWrapper =
      'import {_msg, _static} from \'../../src/magic.js\';' +
      'var _globalExport;(function(){%output%}).call(self);export default _globalExport;';

  // Create a temporary place to store the source map. Closure can only write this to a real file.
  const sourceMapTemp = tmp.fileSync();

  const compilerFlags = {
    js: compilerSrc,
    externs: EXTERNS,
    create_source_map: sourceMapTemp.name,
    assume_function_wrapper: true,
    dependency_mode: 'STRICT',  // ignore all but exported via _globalExportEntry, below
    entry_point: '_globalExportEntry',
    compilation_level: compile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
    warning_level: 'VERBOSE',
    language_in: 'ECMASCRIPT_NEXT',
    language_out: 'ECMASCRIPT_2019',
    process_closure_primitives: true,
    jscomp_off: CLOSURE_DISABLE_WARNINGS,
    output_wrapper: outputWrapper,
    rewrite_polyfills: false,
    inject_libraries: true,  // injects $jscomp when using the Closure Library, harmless otherwise
    use_types_for_optimization: true,
  };

  try {
    const compiler = new closureCompiler.compiler(compilerFlags);

    // Use any native image available, as this can be up to 10x (!) speed improvement on Java.
    const nativeImage = closureCompilerUtils.getNativeImagePath();
    if (nativeImage) {
      console.warn(`Compiling Closure scene ${sceneName} with native image...`);
      compiler.JAR_PATH = undefined;
      compiler.javaPath = nativeImage;
    } else {
      console.warn(`Compiling Closure scene ${sceneName} with Java (unsupported platform=${process.platform})...`);
    }

    const {status, code, log} = await invokeCompiler(compiler);
    if (log.length) {
      console.warn(`# ${sceneName}\n${log}`);
    }
    if (status) {
      throw new Error(`failed to compile ${sceneName}: ${code}`);
    }

    const map = await processSourceMap(await fs.readFile(sourceMapTemp.name));

    // nb. used so that listening callers can watch the whole dir for changes.
    map.sources.push(`static/scenes/${sceneName}/js`, `static/scenes/_shared/js`);
    map.sourcesContent.push(null, null);

    return {code, map};
  } finally {
    sourceMapTemp.removeCallback();
  }
};
