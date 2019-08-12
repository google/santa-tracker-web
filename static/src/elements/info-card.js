import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './info-card.css';


export class InfoCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Boolean},
      href: {type: String},
      src: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  render() {
    return html`
<div class="card">
  <a href=${ifDefined(this.href)}>
    <div class="background" style="background-image: url(${this.src})">
      <div class="lock" ?hidden=${!this.locked}></div>
    </div>
  </a>
  <div class="info"><slot></slot></div>
</div>
`;
  }
}

customElements.define('info-card', InfoCardElement);
