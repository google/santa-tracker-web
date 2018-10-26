const fs = require('fs');
const path = require('path');

module.exports = function resolveBareSpecifiers() {
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
    const cand = path.join('node_modules/', specifier);
    if (ext === '.js') {
      node.source.value = `/${cand}`;
      return;
    }

    // look for package.json in same folder, OR add a .js ext
    let def;
    try {
      const raw = fs.readFileSync(path.join('./', cand, 'package.json'), 'utf8');
      def = JSON.parse(raw);
    } catch (e) {
      node.source.value = `/${cand}.js`;
      return;  // best chance is just to append .js
    }

    const f = def['module'] || def['jsnext:main'] || def['main'] || 'index.js';
    node.source.value = path.join('/', cand, f);
  };

  return {
    visitor: {
      ImportDeclaration: handler,
      ExportNamedDeclaration: handler,
      ExportAllDeclaration: handler,
    },
  };
};