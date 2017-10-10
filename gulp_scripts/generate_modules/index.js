/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Generates a stream of module files based on PolymerBundler's output.
 *
 * Removes excluded HTML imports and <link id="DEV">, for production.
 */

/* jshint node: true */

'use strict';

const path = require('path');
const parse5 = require('parse5');
const stream = require('stream');
const File = require('vinyl');

function generateASTFilter(excludes) {
  function attrsToDict(attrs) {
    const out = {};
    attrs.forEach((attr) => out[attr.name] = attr.value);
    return out;
  }

  excludes = excludes.map((p) => path.resolve(p));
  return (dom, moduleName) => {
    const dir = path.dirname(moduleName);

    walkAST(dom.ast, (node) => {
      if (node.nodeName !== 'link') { return; }

      const attrs = attrsToDict(node.attrs);
      if (attrs['id'] === 'DEV') {
        return true;  // remove <link id="DEV">
      }

      if (excludes.length === 0 || attrs['rel'] !== 'import') { return; }
      const resolvedHref = path.resolve(dir, attrs['href']);
      return excludes.includes(resolvedHref);
    });
  }
}

function walkAST(ast, callback) {
  const pending = [ast];
  while (pending.length) {
    const next = pending.shift();

    if (callback(next) === true) {
      const cn = next.parentNode.childNodes;
      cn.splice(cn.indexOf(next), 1);
      continue;
    } else if (next.childNodes) {
      pending.push(...next.childNodes);
    }
  }
}

/**
 * @param {!BundleResult} result from Polymer's bundler
 * @param {Array<string>=} excludes HTML imports to always exclude from output
 * @return {!stream.Readable}
 */
module.exports = function(result, excludes=null) {
  const s = new stream.Readable({objectMode: true});
  const filter = generateASTFilter(excludes || []);

  s._read = function() {
    result.documents.forEach((dom, moduleName) => {
      filter(dom, moduleName);
      const text = parse5.serialize(dom.ast);
      const f = new File({
        contents: new Buffer(text),
        cwd: '',
        base: '',
        path: moduleName,
      });
      this.push(f);
    });

    this.push(null);
  };

  return s;
};