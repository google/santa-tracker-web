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
