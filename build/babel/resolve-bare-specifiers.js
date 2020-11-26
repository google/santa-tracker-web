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


// TODO(samthor): generate on-demand
const nodeModulesPath = path.join(__dirname, '..', '..', 'node_modules');


/**
 * @param {string} filename that is including other files
 * @return {!Object} Babel plugin
 */
module.exports = function buildResolveBareSpecifiers(filename) {
  const dir = path.dirname(filename);

  const handler = (nodePath) => {
    const node = nodePath.node;
    if (node.source === null) {
      return;
    }
    const specifier = node.source.value;

    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      return;  // do nothing, is a relative URL
    }
    try {
      new URL(specifier);
      return;  // do nothing, is a real URL
    } catch (e) {
      // ignore
    }

    const ext = path.extname(specifier);
    const cand = path.join(nodeModulesPath, specifier);
    if (ext === '.js') {
      node.source.value = path.relative(dir, cand);
      return;
    }

    // look for package.json in same folder, OR add a .js ext
    let def;
    try {
      const raw = fs.readFileSync(path.join(cand, 'package.json'), 'utf8');
      def = JSON.parse(raw);
    } catch (e) {
      node.source.value = path.relative(dir, cand) + `.js`;
      return;  // best chance is just to append .js
    }

    const f = def['module'] || def['jsnext:main'] || def['main'] || 'index.js';
    node.source.value = path.relative(dir, path.join(cand, f));
  };

  return {
    visitor: {
      ImportDeclaration: handler,
      ExportNamedDeclaration: handler,
      ExportAllDeclaration: handler,
    },
  };
};
