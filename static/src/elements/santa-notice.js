/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from 'lit-element';
import styles from './santa-notice.css';
import {_msg} from '../magic.js';
import {localStorage} from '../../src/storage.js';


export class SantaNoticeElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      key: {type: String},
      hidden: {type: Boolean, reflect: true, value: false},
      href: {type: String},
    };
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('key')) {
      this.hidden = this.key in localStorage;
    }
    return true;
  }

  _onClose() {
    this.hidden = true;
    if (this.key) {
      localStorage[this.key] = +new Date();
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