/**
 * @fileoverview Polyfill for the `ParentNode` interface.
 */

function createFragmentOrNode(nodes) {
  nodes = nodes.map((node) => {
    if (typeof node === 'string') {
      return document.createTextNode(node);
    }
    return node;
  });

  if (nodes.length === 1) {
    return node;
  }

  const frag = document.createDocumentFragment();
  nodes.forEach((node) => frag.appendChild(node));
  return frag;
}

if (!('append' in document.body)) {
  Object.defineProperty(Element, 'append', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function append(...nodes) {
      this.appendChild(createFragmentOrNode(nodes));
    },
  });
}

if (!('prepend' in document.body)) {
  Object.defineProperty(Element, 'prepend', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function prepend(...nodes) {
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
