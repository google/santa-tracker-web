import styles from './santa-interlude.css';


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

  animate() {
    this.setAttribute('active', '');
    return this._animatePromise;
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
            resolve();  // resolve if nothing changed
          }
        }, 1500);
      });

    } else {

      if (this._animateResolve) {
        this._animateResolve();
        this._animateResolve = null;
        this._animatePromise = null;
      }

    }
  }
}

customElements.define('santa-interlude', SantaInterludeElement);