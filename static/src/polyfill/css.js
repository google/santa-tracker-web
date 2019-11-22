/**
 * @fileoverview Polyfills Constructable Style Sheets for our purposes.
 */

let nativeSupport = false;
try {
  new CSSStyleSheet();
  nativeSupport = 'adoptedStyleSheets' in ShadowRoot.prototype;
} catch (e) {
  // ignore
}

if (nativeSupport) {
  // FIXME: This pretends to be a "CSSResult" from `lit-element` and provide a "styleSheet" attr:
  // https://github.com/Polymer/lit-element/issues/774
  Object.defineProperty(CSSStyleSheet.prototype, 'styleSheet', {
    get() {
      return this;
    },
  });
} else {
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
      // FIXME: This pretends to be a "CSSResult" from `lit-element`:
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
  };

  const instantiated = Symbol('instantiated');  // actually created <style> nodes

  function rectifyAdoptedStyleSheets(holder) {
    const expected = /** @type {!Array<HTMLStyleElement>} */ (this[instantiated] || []);

    // Check that nodes [0,n] are the expected HTMLStyleElement instances.
    // nb. this doesn't guard against users making local changes to textContent
    let ok = (holder.childNodes.length >= expected.length);
    for (let i = 0; ok && i < expected.length; ++i) {
      if (holder.childNodes[i] !== expected[i]) {
        ok = false;
      }
    }
    if (ok) {
      return;
    }

    // Nuke all previous instantiated sheets.
    expected.forEach((node) => {
      node.parentNode && node.parentNode.removeChild(node);
    });

    // Prepare clones of target CSSStyleSheetConstructor instances.
    const targetBefore = holder.firstChild;
    this[instantiated].forEach((node) => holder.insertBefore(node, targetBefore));
  }

  const adopted = Symbol('adopted'); // CSSStyleSheetConstructor instances adopted
  const def = {
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
      this[adopted] = v;
      this[instantiated] = v.map((instance) => {
        if (!(instance instanceof window.CSSStyleSheetConstructor)) {
          throw new Error(`unsupported adopted type: ${instance}`);
        } else if (instance.cssText === null) {
          throw new Error(`cannot adopt uninstantiated CSSStyleSheet`);
        }
        const node = document.createElement('style');
        node.textContent = instance.cssText;
        return node;
      });

      const node = (this === document ? document.head : this);
      const call = rectifyAdoptedStyleSheets.bind(this, node);

      const o = new MutationObserver(call);

      if (!(this instanceof ShadowRoot)) {
        console.warn('Shadow DOM polyfill + adoptedStyleSheets polyfill, no MutationObserver');
      } else {
        o.observe(this, {childList: true});
      }

      call();
    }
  };

  Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', def);
  Object.defineProperty(HTMLDocument.prototype, 'adoptedStyleSheets', def);
}
