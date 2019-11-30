import {html, LitElement} from 'lit-element';
import styles from './santa-notice.css';
import {_msg} from '../magic.js';


const localStorage = window.localStorage || {};


export class SantaNoticeElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      key: {type: String},
      hidden: {type: Boolean, reflect: true, value: false},
      href: {type: String},
    };
  }

  constructor() {
    super();
    if (this.key) {
      this.hidden = this.key in localStorage;
    }
  }

  _onClose() {
    this.hidden = true;
    if (this.key) {
      localStorage[this.key] = 'yes';
    }
  }

  render() {
    const details = this.href ? html`<a class="button" href=${this.href} target="_blank" rel="noopener">${_msg`notice_cookies_details`}</a>` : '';
    return html`
<div id="holder">
  <p><slot></slot></p>
  <div class="buttons">
    ${details}
    <button class="button" @click=${this._onClose}>${_msg`okay`}</button>
  </div>
</div>
    `;
  }
}

customElements.define('santa-notice', SantaNoticeElement);