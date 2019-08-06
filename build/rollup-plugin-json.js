const JSON5 = require('json5');

module.exports = function() {
  return {
    transform(raw, id) {
      if (!id.endsWith('.json') && !id.endsWith('.json5')) {
        return;
      }

      // TODO: does {mappings: ''} below include us?
      const map = {
        sources: [id],  // TODO(samthor): Is 'id' the resolved path?
        sourcesContent: [raw],
      };

      const parsed = JSON5.parse(raw);
      return {code: `export default ${JSON.stringify(parsed)};`, map: {mappings: ''}};
    },
  };
};
