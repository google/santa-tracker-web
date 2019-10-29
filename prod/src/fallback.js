
/**
 * Determines load type. Santa Tracker supports modern browsers like Edge (non-Edgium), Chrome,
 * Firefox and Safari. We load a fallback environment (and polyfills) if the browser does not hit
 * minimum standards.
 *
 * @return {boolean} whether to load fallback environment
 */
export default function() {
  try {
    if (!CSS.supports("(--foo: red)")) {
      // need CSS variable support for most modern scenes and the modern entrypoint
      throw 'CSS Variables';
    }
    if (!('noModule' in HTMLScriptElement.prototype)) {
      // modern code is loaded as modules
      throw '<script type="module">';
    }
    if (!('URLSearchParams' in window)) {
      // stops IE11
      throw 'URLSearchParams';
    }
    if (!('Symbol' in window)) {
      // stops IE11
      throw 'Symbol';
    }
    if (!('includes' in String.prototype && 'startsWith' in String.prototype && 'includes' in Array.prototype && 'from' in Array)) {
      // stops IE11 and browsers without standard niceities
      throw 'arraylike helpers';
    }
    if (!('append' in document.body)) {
      // friendly node helpers
      throw 'append';
    }
    try {
      const e = window.eval;
      e('async () => { await Promise.resolve(1); }');
    } catch (e) {
      // need to rewrite this sort of code for older browsers
      throw 'async/await';
    }
  } catch (e) {
    console.warn('loading fallback, failure:', e);
    return true;
  }

  return false;
}
