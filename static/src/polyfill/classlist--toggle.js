/**
 * @fileoverview Polyfill for the 2nd arg to `ClassList.toggle`.
 */

const testEl = document.createElement('div');
testEl.classList.toggle('testClass', false);
if (testEl.classList.contains('testClass')) {
  const original = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(name, force) {
    if (force === undefined) {
      return original.call(this, name);
    } else if (force) {
      this.add(name);
    } else {
      this.remove(name);
    }
    return this.contains(name);
  };
}
