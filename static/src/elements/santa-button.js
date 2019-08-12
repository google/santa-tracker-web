import {html, LitElement} from 'lit-element';
import styles from './santa-button.css';


export class SantaButtonElement extends LitElement {
  static get properties() {
    return {
      color: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  render() {
    return html`
<button class="${this.color || 'yellow'}"><slot></slot></button>
`;
  }
}


customElements.define('santa-button', SantaButtonElement);
