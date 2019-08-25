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

    this.shadowRoot.innerHTML = `
<div id="container">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
    `;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    
  }
}

customElements.define('santa-interlude', SantaInterludeElement);