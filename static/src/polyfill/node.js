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
    return nodes[0];
  }

  var frag = document.createDocumentFragment();
  nodes.forEach(function(node) {
    frag.appendChild(node);
  });
  return frag;
}

if (!('append' in document.body)) {
  Object.defineProperty(Element.prototype, 'append', {
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
  Object.defineProperty(Element.prototype, 'prepend', {
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
  Object.defineProperty(Element.prototype, 'remove', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function prepend() {
      this.parentNode && this.parentNode.removeChild(this);
    },
  });
}

// TODO: polyfill the rest of ChildNode
