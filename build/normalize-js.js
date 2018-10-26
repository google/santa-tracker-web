const babelCore = require('@babel/core');
const babylon = require('babylon');
const fs = require('fs');
const path = require('path');


// TODO(samthor): generate on-demand
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');


/**
 * @param {string} filename that is including other files
 * @return {!Object} Babel plugin
 */
function buildResolveBareSpecifiers(filename) {
  const dir = path.dirname(filename);

  const handler = (nodePath) => {
    const node = nodePath.node;
    if (node.source === null) {
      return;
    }
    const specifier = node.source.value;

    try {
      new URL(specifier);
      return;  // do nothing, is a real URL
    } catch (e) {
      // ignore
    }
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      return;  // do nothing, is a relative URL
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


/**
 * @param {function(string, string): (string|undefined)}
 * @return {!Object} Babel plugin
 */
function buildTemplateTagHelper(resolver) {
  const handler = (nodePath) => {
    const {node, parent} = nodePath;
    const {tag, quasi} = node;

    const qnode = quasi.quasis[0];
    if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
      return;  // not sure what to do here
    }
    const key = qnode.value.raw;
    const update = resolver(tag.name, key);
    if (update === undefined) {
      return;
    } else if (typeof update !== 'string') {
      throw new TypeError(`handler returned non-string for tag '${tag.name}': ${typeof update}`);
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
  };

  return {
    visitor: {TaggedTemplateExpression: handler},
  };
};


/**
 * @param {string} filename where source is located
 * @param {string} js to normalize
 * @return {string} output JS
 */
module.exports = (filename, js, inlineHandler) => {
  const ast = babylon.parse(js, {
    sourceType: 'module',
    plugins: [
      'asyncGenerators',
      'objectRestSpread',
    ],
  });

  const plugins = [
    buildResolveBareSpecifiers(filename),
    buildTemplateTagHelper(inlineHandler),
  ];
  const result = babelCore.transformFromAst(ast, js, {presets: [], plugins});
  return result.code;
};
