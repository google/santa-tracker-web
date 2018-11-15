const path = require('path');

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
    let resolved;
    try {
      resolved = require.resolve(specifier);
    } catch (e) {
      return;  // nothing to do
    }
    node.source.value = path.relative(dir, resolved);
  };

  return {
    visitor: {
      ImportDeclaration: handler,
      ExportNamedDeclaration: handler,
      ExportAllDeclaration: handler,
    },
  };
};
