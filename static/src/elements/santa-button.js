import {html, LitElement} from 'lit-element';
import styles from './santa-button.css';


export class SantaButtonElement extends LitElement {
  static get styles() {
    return [styles];
  }

  static get properties() {
    return {
      color: {type: String},
      disabled: {type: Boolean, reflect: true},
    };
  }

  render() {
    return html`
<button class="${this.color || 'yellow'}" .disabled=${this.disabled} @click=${this._maybePreventClick}><slot></slot></button>
`;
  }

  _maybePreventClick(event) {
    if (this.disabled) {
      event.stopImmediatePropagation();
    }
  }
}


customElements.define('santa-button', SantaButtonElement);
