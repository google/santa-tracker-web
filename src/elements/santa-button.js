import {html, LitElement} from 'lit-element';


export class SantaButtonElement extends LitElement {
  static get properties() {
    return {
      color: {type: String},
    };
  }

  render() {
    return html`
<style>${_style`santa-button`}</style>
<button class="${this.color || 'yellow'}"><slot></slot></button>
`;
  }
}


customElements.define('santa-button', SantaButtonElement);
