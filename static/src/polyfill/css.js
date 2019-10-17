/**
 * @fileoverview Polyfills Constructable Style Sheets for our purposes.
 */

const attachedTo = Symbol('attachedTo');
const styleNode = Symbol('styleNode');

let nativeSupport = false;
try {
  new CSSStyleSheet();
  nativeSupport = 'adoptedStyleSheets' in ShadowRoot.prototype;
} catch (e) {
  // ignore
}

if (!nativeSupport) {
  // This polyfill works by creating a completely new class of CSSStyleSheetConstructor, which is
  // used by the CSS Module polyfill code in "build/transform-future-modules.js". However, it's
  // largely ignored by lit-element (and only used by 'vanilla' Web Components), _except_ that
  // lit-element calls `.cssText` to create its own <style> nodes.

  window.CSSStyleSheetConstructor = class {
    constructor(options) {
      if (options) {
        throw new DOMException('NotSupportedError');
      }
      this._cssText = null;
    }

    get cssText() {
      // FIXME: This pretends to be a "CSSResult" from `lit-element:
      // https://github.com/Polymer/lit-element/issues/774
      return this._cssText;
    }

    replaceSync(cssText) {
      if (this._cssText !== null) {
        throw new DOMException('NotAllowedException', 'polyfill supports single replaceSync()');
      }
      this._cssText = String(cssText);
    }

    replace() {
      throw new DOMException('NotSupportedError');
    }

    insertRule() {
      throw new DOMException('NotSupportedError');
    }

    deleteRule() {
      throw new DOMException('NotSupportedError');
    }
  }

  const adopted = Symbol('adopted');            // CSSStyleSheet instances wanted
  const instantiated = Symbol('instantiated');  // actually created <style> nodes
  const owner = Symbol('owner');                // <style> node's CSSStyleSheet owner

  function rectifyAdoptedStyleSheets() {
    const expected = this[adopted];

    // Check that nodes [0,n] point back to the expected CSSStyleSheet.
    // nb. this doesn't guard against users making local changes to textContent
    let ok = (this.childNodes.length >= expected.length);
    for (let i = 0; ok && i < expected.length; ++i) {
      const check = this.childNodes[i];
      if (check[owner] !== expected[i]) {
        ok = false;
      }
    }
    if (ok) {
      return;
    }

    // Nuke all previous instantiated sheets.
    (this[instantiated] || []).forEach((node) => {
      node.parentNode && node.parentNode.removeChild(node);
    });
    console.debug('rectifying root', this, 'with', expected);

    // Prepare clones of target CSSStyleSheet instances.
    const targetBefore = this.firstChild;
    const styleNodes = expected.map((sheet) => {
      const node = document.createElement('style');
      node.textContent = sheet.cssText;
      node[owner] = sheet;  // this is owned by CSSStyleSheetConstructor
      this.insertBefore(node, targetBefore);
      return node;
    });
    this[instantiated] = styleNodes;
  }

  Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
    get() {
      return this[adopted] || [];
    },
    set(v) {
      if (adopted in this) {
        throw new DOMException('NotSupportedError', 'can only set adopted once');
      }
      if (!v || !v.length) {
        return;  // nothing to do
      }

      const cloned = [];
      for (let i = 0; i < v.length; ++i) {
        if (!(v[i] instanceof window.CSSStyleSheetConstructor)) {
          throw new Error(`unsupported adopted type: ${v[i]}`);
        } else if (v[i].cssText === null) {
          throw new Error(`cannot adopt uninstantiated CSSStyleSheet`);
        }
        cloned.push(v[i]);
      }

      this[adopted] = cloned;
      const o = new MutationObserver(rectifyAdoptedStyleSheets.bind(this));
      o.observe(this, {childList: true});
      rectifyAdoptedStyleSheets.call(this);

    }
  });
}
