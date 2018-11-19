const fsp = require('./fsp.js');
const parse5 = require('parse5');
const parser = new (require('jsdom/lib/jsdom/living')).DOMParser();

/**
 * Minimal adapter for JSDom.
 */
const treeAdapter = {
  getFirstChild: (node) => node.childNodes[0],
  getChildNodes: (node) => node.childNodes,
  getParentNode: (node) => node.parentNode,
  getAttrList: (node) => node.attributes,
  getTagName: (node) => node.tagName.toLowerCase(),
  getNamespaceURI: (node) => node.namespaceURI || 'http://www.w3.org/1999/xhtml',
  getTemplateContent: (node) => node.content,
  getTextNodeContent: (node) => node.nodeValue,
  getCommentNodeContent: (node) => node.nodeValue,
  getDocumentTypeNodeName: (node) => node.name,
  getDocumentTypeNodePublicId: (node) => doctypeNode.publicId || null,
  getDocumentTypeNodeSystemId: (node) => doctypeNode.systemId || null,
  isTextNode: (node) => node.nodeName === '#text',
  isCommentNode: (node) => node.nodeName === '#comment',
  isDocumentTypeNode: (node) => node.nodeType === 10,
  isElementNode: (node) => Boolean(node.tagName),
};

/**
 * Parse the input into a JSDom document.
 *
 * @param {string|!Buffer} src
 * @return {!Document}
 */
function parse(src) {
  return parser.parseFromString(src.toString(), 'text/html');
}

module.exports = {
  parse,

  /**
   * Parse the file into a JSDom document.
   *
   * @param {string} filename
   * @return {!Promise<!Document>}
   */
  async read(filename) {
    const raw = await fsp.readFile(filename, 'utf8');
    return parse(raw);
  },

  /**
   * Seralize the JSDom document or node.
   *
   * @param {!Node|!Document} node
   */
  serialize(node) {
    if ('innerHTML' in node) {
      return node.innerHTML;
    }
    return parse5.serialize(node, {treeAdapter});
  },

};
