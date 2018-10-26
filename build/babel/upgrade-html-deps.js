const babelCore = require('@babel/core');
const sass = require('sass');

const messages = require('../../en_src_messages.json');

module.exports = function upgradeHTMLDeps() {
  return {
    visitor: {
      TaggedTemplateExpression(nodePath) {
        const {node, parent} = nodePath;
        const {tag, quasi} = node;

        const qnode = quasi.quasis[0];
        if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
          return;  // not sure what to do here
        }
        const key = qnode.value.raw;
        let update;

        if (tag.name === '_msg') {
          const object = messages[key];
          const message = object && (object.raw || object.message) || '?';
          update = message;
        } else if (tag.name === '_style') {
          const result = sass.renderSync({file: `styles/${key}.scss`});
          update = result.css.toString();
        }
        if (update === undefined) {
          return;
        }

        // see if we're the direct child of a literal, e.g. ${_msg`foo`}
        const index = parent.expressions.indexOf(node);
        if (parent.type !== 'TemplateLiteral' || index === -1) {
          // ... we're not, just insert the string whereever
          nodePath.replaceWith(babelCore.types.stringLiteral(update));
          return;
        }

        // merge the prev/next quasis with the updated value
        const qnew = parent.quasis.slice();
        const qprev = qnew.slice(index, index + 2);
        qnew.splice(index, 2, babelCore.types.templateElement({
          raw: qprev[0].value.raw + update + qprev[1].value.raw,
          cooked: qprev[0].value.cooked + update + qprev[1].value.cooked,
        }));

        // remove the expression
        const enew = parent.expressions.slice();
        enew.splice(index, 1);

        // replace the whole parent templateLiteral
        const replacement = babelCore.types.templateLiteral(qnew, enew);
        nodePath.parentPath.replaceWith(replacement);
      },
    },
  };
};