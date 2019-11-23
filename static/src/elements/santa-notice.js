import {html, LitElement} from 'lit-element';
import styles from './santa-notice.css';
import {_msg} from '../magic.js';


const localStorage = window.localStorage || {};
const sessionStorage = window.sessionStorage || {};
const key = 'cookie-ok';


export class SantaNoticeElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      hidden: {type: Boolean, reflect: true, value: false},
    };
  }

  constructor() {
    super();
    this.hidden = key in localStorage || sessionStorage['android-twa'];
  }

  _onClose() {
    this.hidden = true;
    localStorage[key] = 'yes';
  }

  render() {
    return html`
<div id="holder">
  <p>${_msg`notice_cookies`}</p>
  <div class="buttons">
    <a class="button" href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener">${_msg`notice_cookies_details`}</a>
    <button class="button" @click=${this._onClose}>${_msg`okay`}</button>
  </div>
</div>
    `;
  }
}

customElements.define('santa-notice', SantaNoticeElement);