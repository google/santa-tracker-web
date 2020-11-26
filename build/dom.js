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
