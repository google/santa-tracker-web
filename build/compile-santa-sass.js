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

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const url = require('url');

const compressed = true;

// Define helpers that call out to native functions. Native functions can't read the current scope,
// so these exist to pass the current value of $__filename.
const fixedPreamble = `// fixed preamble for Santa SASS compilation, should never be seen
$__filename: "";

@function _rel($arg) {
  @return -native-rel($__filename, $arg);
}
`;

/**
 * Explicitly sync function to compile SASS to CSS for Santa Tracker.
 *
 * This adds support for relative URL helpers in a reasonably gross way.
 *
 * @param {string} filename to compile
 * @param {?string=} scope URL scope to position files absolutely under
 * @param {string=} root to position assets relative to, null for file
 */
module.exports = (filename, scope=null, root='.') => {
  const dirname = path.dirname(filename);

  if (scope === null) {
    // This is the 'include CSS via <link>' case, where assets are relative to the loaded URL.
    root = path.dirname(path.resolve(filename));
  }

  const functions = {
    '-native-rel($filename, $target)': (filenameArg, targetArg) => {
      const dirname = path.dirname(filenameArg.getValue());
      const found = path.join(dirname, targetArg.getValue());

      const rel = path.relative(root, found);
      const u = scope ? url.resolve(scope, rel) : rel;

      return new sass.types.String(`url(${encodeURI(u)})`);
    },
  };

  const options = {
    data: `${fixedPreamble}@import "${encodeURI(filename)}"`,
    sourceMap: true,
    sourceMapContents: false,
    sourceMapEmbed: false,
    omitSourceMapUrl: true,
//    sourceMapRoot: '.',
    outFile: filename,  // just used for relative paths
    functions,
  };
  if (compressed) {
    options.outputStyle = 'compressed';
  }

  let result;
  const sourceMapContents = {};
  const originalReadFileSync = fs.readFileSync;
  try {
    // yes -- really. Apologies to those reading this in future.
    // This magic ensures that $__filename is set to the currently executing file during its run.
    // We save the real source contents to insert into the sourceMap later.
    fs.readFileSync = (p, o) => {
      if (o !== 'utf8') {
        throw new Error('expected dart-sass to read with options=utf8');
      }
      if (!path.isAbsolute(p)) {
        throw new Error(`expected dart-sass to read absolute URL: ${p}`)
      }

      const fileContents = originalReadFileSync(p, o);
      sourceMapContents[p] = fileContents;

      // This hack works because source maps are only per-line, and the prefix here doesn't effect
      // a browser's ability to map back to the original source.
      return `$__held_filename:$__filename;$__filename:"${p}";${fileContents}
$__filename:$__held_filename;`;  // must be on newline to prevent comments leaking
    };
    result = sass.renderSync(options);
  } finally {
    fs.readFileSync = originalReadFileSync;
  }

  const map = JSON.parse(result.map.toString());

  map.sourcesContent = [];
  map.sources = map.sources.map((source) => {
    // SASS sometimes returns us absolute files that probably start with file://.
    if (source.startsWith('file://')) {
      source = source.substr(7);

      if (!path.isAbsolute(source)) {
        throw new Error(`had unexpected relative URL from sass: ${source}`);
      }
    }

    // If this isn't absolute then it's actually relative to the original filename, not to the
    // current working directory (which is what path.resolve would use).
    if (!path.isAbsolute(source)) {
      source = path.join(dirname, source);
    }

    map.sourcesContent.push(sourceMapContents[source] || null);
    return path.relative(dirname, source);
  });

  return {
    code: result.css.toString(),
    map,
  };
};