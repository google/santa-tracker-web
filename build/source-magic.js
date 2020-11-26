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
const t = babel.types;
const path = require('path');
const importUtils = require('./import-utils.js');

/*
TODO(samthor): This is fine but can be done differently.

Right now, this identifies certain named imports as magic. The AST parser below identifies their
use before storing them and letting us replace them at a later point in time (for i18n). In this
approach, we prevent use of imports in any way _but_ a TaggedTemplateExpression.

The alternative is to provide a fake import (that gets rolled up by Rollup "properly") that ends
up including real methods that we can resolve with Babel's evaluate helpers. This has a benefit in
that we can 'follow' the helper around, e.g.:

  const ast = await babel.parseAsync('const _msg=function __magic_msg(){}; var x = _msg; var q = x; q`foo`;');
  traverse.default(ast, {
    Identifier(nodePath) {
      const name = nodePath.node.name;
      if (nodePath.parentPath.node.type !== 'TaggedTemplateExpression') {
        return;
      }

      const adjacent = nodePath.parentPath.insertBefore(babel.types.identifier(name))[0];
      const evaluated = adjacent.evaluate();
      if (evaluated.confident) {
        throw new Error('babel should not evaluate this');
      }
      const node = evaluated.deopt.node;
      if (node.type !== 'FunctionExpression') {
        throw new Error('expected magic function, was: ' + node.type);
      }

      const id = node.id;
      if (id) {
        console.warn('name=', id.name);
      } else {
        console.warn('no name');
      }

      // console.info(evaluated.deopt.node);
    },
  });
*/

module.exports = () => {
  const magicImportNodes = new Set();
  const importDeclarations = new Map();
  const tagged = {};

  const matchesImportNode = (taggedTemplateNodePath) => {
    const tagNodePath = taggedTemplateNodePath.get('tag');

    for (const importNodePath of magicImportNodes) {
      const v = importNodePath.node.source.value;
      const r = tagNodePath.referencesImport(v, tagNodePath.node.name);
      if (r) {
        return true;
      }
    }
    return false;
  };

  /**
   * Ensure that the given name exists inside the tagged map.
   *
   * @param {string}
   * @return {!Map<*, *>}
   */
  const getTagged = (name) => {
    const prev = tagged[name];
    if (prev !== undefined) {
      return prev;
    }
    const update = new Map();
    tagged[name] = update;
    return update;
  };

  const plugin = {
    pre(state) {
      if (this.run) {
        throw new Error(`can only run magic plugin once`);
      }
      this.run = true;
    },
    post(state) {
      // If this crashes, it's probably because another plugin removed the `import` declaration.
      magicImportNodes.forEach((nodePath) => nodePath.remove());
    },
    visitor: {
      ImportDeclaration(nodePath) {
        const {node} = nodePath;
        if (node.source.value === '__magic') {
          magicImportNodes.add(nodePath);
        } else {
          importDeclarations.set(nodePath, node.source.value);
        }
      },

      TaggedTemplateExpression(nodePath) {
        if (!matchesImportNode(nodePath)) {
          return;
        }

        const taggedNode = nodePath.node;
        const name = taggedNode.tag.name;
        const {quasi} = taggedNode;

        // Confirm that we look like "_foo`bar`" without ${}'s
        const qnode = quasi.quasis[0];
        if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
          throw new TypeError(`got non-static magic import replacer`);
        }
        const key = qnode.value.raw;

        // Just replace with something that we'll notice if we miss.
        nodePath.replaceWith(t.nullLiteral());

        const all = getTagged(name);
        all.set(nodePath, key);
      },
    },
  };

  return {
    plugin,

    seen(name) {
      return name in tagged;
    },

    visit(id, visitor) {
      const dir = path.dirname(id);

      for (const name in tagged) {
        const all = tagged[name];
        all.forEach((key, nodePath) => {
          const update = visitor.taggedTemplate(name, key);
          if (typeof update !== 'string') {
            throw new Error(`expected taggedTemplate string update, got ${update}`);
          }
          nodePath.replaceWith(t.stringLiteral(update));
        });
      };

      importDeclarations.forEach((value, nodePath) => {
        const resolved = path.join(dir, value);
        const update = visitor.rewriteImport(resolved);
        if (update) {
          const rel = importUtils.relativize(path.relative(dir, update));
          const sourcePath = nodePath.get('source');
          sourcePath.replaceWith(t.stringLiteral(rel));
        }
      });
    },
  };
};