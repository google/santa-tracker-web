const babel = require('@babel/core');
const t = babel.types;
const traverse = require('@babel/traverse');
const generator = require('@babel/generator');

module.exports = (visitor) => {

  return async (code) => {
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
          const update = visitor.rewriteImport(lang, value) || value;
//          console.info(nodePath);
// might work??
          nodePath.node.source.value = update;
        });

        const {code} = generator.default(ast, {comments: false});
        return code;
      },
    };
  };
};