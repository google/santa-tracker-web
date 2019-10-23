import {html, LitElement} from 'lit-element';
import styles from './santa-notice.css';
import {_msg} from '../magic.js';


export class SantaNoticeElement extends LitElement {
  static get properties() {
    return {
      _hidden: {
        type: Boolean,
        value: false,
      },
    };    
  }

  constructor() {
    super();   
    this.shadowRoot.adoptedStyleSheets = [styles]; 
  }

  _close() {
    this._hidden = true;
  }

  render() {
      return html`
        <div id="holder" hidden="${this._hidden}">
            <p>${_msg`notice_cookies`}</p>
            <div class="buttons">
            <button class="button" @click=${this._close}>${_msg`okay`}</button>
            <a class="button" href="https://www.google.com/intl/en/policies/technologies/cookies/" target="_blank">${_msg`notice_cookies_details`}</a>
            </div>
        </div>
      `;
  }
}

customElements.define('santa-notice', SantaNoticeElement);