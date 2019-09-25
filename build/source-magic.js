const babel = require('@babel/core');
const t = babel.types;
const path = require('path');
const traverse = require('@babel/traverse');
const generator = require('@babel/generator');
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

module.exports = (visitor) => {

  return async (code, id) => {
    const ast = await babel.parseAsync(code);
    const importDeclarations = new Map();
    const tagged = new Map();

    const getTagged = (name) => {
      const prev = tagged.get(name);
      if (prev !== undefined) {
        return prev;
      }
      const update = [];
      tagged.set(name, update);
      return update;
    };

    // Record all locations within the AST that can potentially be replaced.
    traverse.default(ast, {
      ImportDeclaration(nodePath) {
        const {node} = nodePath;
        if (!visitor.magicImport(node.source.value)) {
          importDeclarations.set(nodePath, node.source.value);
          return;  // just store for later
        }

        // ... walk and find all template tagged use of this import
        nodePath.parentPath.traverse({
          Identifier(nodePath) {
            const name = nodePath.node.name;
            const r = nodePath.referencesImport(node.source.value, name);
            if (!r) {
              return;
            }

            if (nodePath.parentPath.node.type !== 'TaggedTemplateExpression') {
              throw new TypeError(`imports from magic can only be TaggedTemplateExpression: ${name} was ${nodePath.parentPath.node.type}`);
            }

            const taggedNodePath = nodePath.parentPath;
            const taggedNode = taggedNodePath.node;
            const {quasi} = taggedNode;

            // Confirm that we look like "_foo`bar`" without ${}'s
            const qnode = quasi.quasis[0];
            if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
              throw new TypeError(`got non-static magic import replacer`);
            }
            const key = qnode.value.raw;

            // Just replace with something that we'll notice if we miss.
            taggedNodePath.replaceWith(t.nullLiteral());

            const all = getTagged(name);
            all.push({key, nodePath: taggedNodePath});
          },
        });

        // remove now unneeded magic import
        nodePath.remove();
      },
    });

    const dir = path.dirname(id);

    return {
      seen: new Set(tagged.keys()),
      rewrite(lang) {
        tagged.forEach((all, name) => {
          all.forEach(({key, nodePath}) => {
            const update = visitor.taggedTemplate(lang, name, key);
            if (typeof update !== 'string') {
              nodePath.replaceWith(t.nullLiteral());
            } else {
              nodePath.replaceWith(t.stringLiteral(update));
            }
          });
        });

        importDeclarations.forEach((value, nodePath) => {
          const resolved = path.join(dir, value);
          const update = visitor.rewriteImport(lang, resolved);
          if (update) {
            const rel = importUtils.relativize(path.relative(dir, update));
            const sourcePath = nodePath.get('source');
            sourcePath.replaceWith(t.stringLiteral(rel));
          }
        });

        const {code} = generator.default(ast, {comments: false});
        return code;
      },
    };
  };
};