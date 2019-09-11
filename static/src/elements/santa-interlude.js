import styles from './santa-interlude.css';


// TODO(samthor): This is very hard-coded vs CSS.
const ANIMATION_DURATION = 1500;


/**
 * Displays a random interlude.
 */
class SantaInterludeElement extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot.adoptedStyleSheets = [styles];

    this._animatePromise = null;
    this._animateResolve = null;

    this._activeEventTimeout = 0;

    this.shadowRoot.innerHTML = `
<div id="container">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
    `;

    if (this.hasAttribute('active')) {
      this.attributeChangedCallback('active', undefined, this.getAttribute('active'));
    }
  }

  /**
   * Causes this interlude to take over the whole screen, returning a Promise when complete or
   * cancelled.
   *
   * @return {!Promise<boolean>} true if complete, false if cancelled eearly
   */
  show() {
    this.setAttribute('active', '');
    return this._animatePromise;
  }

  /**
   * Hides this interlude.
   */
  hide() {
    this.removeAttribute('active');
  }

  set active(v) {
    this.toggleAttribute('active', v);
  }

  get active() {
    return this.hasAttribute('active');
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName !== 'active') {
      return;
    }

    const isActive = (newValue !== null);
    if (isActive) {

      this._animatePromise = new Promise((resolve) => {
        this._animateResolve = resolve;

        window.setTimeout(() => {
          if (this._animateResolve === resolve) {
            resolve(true);  // resolve if nothing changed
          }
        }, ANIMATION_DURATION);
      });

    } else {

      if (this._animateResolve) {
        this._animateResolve(false);
        this._animateResolve = null;
        this._animatePromise = null;
      }

    }
  }
}

customElements.define('santa-interlude', SantaInterludeElement);