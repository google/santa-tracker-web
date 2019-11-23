/**
 * @fileoverview Polyfill for the `ParentNode` interface.
 *
 * Run in support mode. Use only ES5.
 */

function createFragmentOrNode(nodes) {
  nodes = nodes.map(function(node) {
    if (typeof node === 'string') {
      return document.createTextNode(node);
    }
    return node;
  });

  if (nodes.length === 1) {
    return node;
  }

  var frag = document.createDocumentFragment();
  nodes.forEach(function(node) {
    frag.appendChild(node);
  });
  return frag;
}

if (!('append' in document.body)) {
  Object.defineProperty(Element, 'append', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function append() {
      var nodes = Array.prototype.slice.call(arguments);
      this.appendChild(createFragmentOrNode(nodes));
    },
  });
}

if (!('prepend' in document.body)) {
  Object.defineProperty(Element, 'prepend', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function prepend() {
      var nodes = Array.prototype.slice.call(arguments);
      this.insertBefore(createFragmentOrNode(nodes), this.firstChild);
    },
  });
}

if (!('remove' in document.body)) {
  Object.defineProperty(Element, 'remove', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function prepend() {
      this.parentNode && this.parentNode.removeChild(this);
    },
  });
}

// TODO: polyfill the rest of ChildNode
