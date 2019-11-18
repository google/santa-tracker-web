import {html, LitElement} from 'lit-element';
import styles from './santa-button.css';


export class SantaButtonElement extends LitElement {
  static get styles() {
    return [styles];
  }

  static get properties() {
    return {
      color: {type: String},
    };
  }

  render() {
    return html`
<button class="${this.color || 'yellow'}"><slot></slot></button>
`;
  }
}


customElements.define('santa-button', SantaButtonElement);
