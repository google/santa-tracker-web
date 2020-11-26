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

const babel = require('@babel/core');
const path = require('path');
const t = babel.types;

/**
 * @param {function(string, string): (string|undefined)}
 * @return {!Object} Babel plugin
 */
module.exports = function buildTemplateTagReplacer(mapper) {
  // nb. not an arrow function, so we get the context this
  const handler = function(nodePath) {
    const filename = this.file.opts.filename;
    const dirname = path.dirname(filename);

    const {node, parent} = nodePath;
    const {tag, quasi} = node;

    const qnode = quasi.quasis[0];
    if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
      return;  // not sure what to do here
    }
    const key = qnode.value.raw;
    const raw = mapper(tag.name, key, dirname);
    if (raw === undefined) {
      return;
    } else if (raw instanceof Buffer) {
      // fine
    } else if (typeof raw !== 'string') {
      throw new TypeError(`handler returned non-string for tag '${tag.name}': ${typeof raw}`);
    }
    const update = raw.toString();  // catches Buffer

    // see if we're the direct child of a literal, e.g. ${_msg`foo`}
    const index = (parent.expressions || []).indexOf(node);
    if (parent.type !== 'TemplateLiteral' || index === -1) {
      // ... we're not, just insert the string whereever
      nodePath.replaceWith(t.stringLiteral(update));
      return;
    }

    // merge the prev/next quasis with the updated value
    const qnew = parent.quasis.slice();
    const qprev = qnew.slice(index, index + 2);
    qnew.splice(index, 2, t.templateElement({
      raw: qprev[0].value.raw + update + qprev[1].value.raw,
      cooked: qprev[0].value.cooked + update + qprev[1].value.cooked,
    }));

    // remove the expression
    const enew = parent.expressions.slice();
    enew.splice(index, 1);

    // replace the whole parent templateLiteral
    const replacement = t.templateLiteral(qnew, enew);
    nodePath.parentPath.replaceWith(replacement);
  };

  return {
    visitor: {TaggedTemplateExpression: handler},
  };
};