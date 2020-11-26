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

import {html, LitElement} from "lit-element";
import styles from './santa-error.css';
import {_msg} from '../magic.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

class SantaErrorElement extends LitElement {
  static get properties() {
    return {
      code: {type: String},
      locked: {type: Boolean},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this.code = null;
    this.locked = false;
  }

  render() {
    // nb. the following messages include relative <a> links. This should only be running in prod,
    // so it's safe to inline.

    const offlineHint = navigator.onLine ? '' : html`<p>${_msg`offline_user_message`}</p>`;

    let raw = null;
    if (this.code === 'missing') {
      raw = _msg`error-not-found`;
    } else if (this.code) {
      raw = _msg`error-internal`;
    }

    const text = raw ? html`<p>${unsafeHTML(raw)}</p>`: '';
    return html`
<main>
  ${offlineHint}
  <div class="icon">
    <div class="lock" ?hidden=${!this.locked}>
      <svg xmlns="http://www.w3.org/2000/svg"><linearGradient id="a" x1="611.816" x2="611.816" y1="68.432" y2="-1.787" gradientTransform="matrix(1 0 -.1113 1.0016 -562.848 7.96)" gradientUnits="userSpaceOnUse"><stop offset="0"/><stop offset="1" stop-color="#2a2627" stop-opacity="0"/></linearGradient><path fill="url(#a)" d="M80.5 41.3c-4 19.4-23.1 35.2-42.5 35.2S6 60.8 10 41.3 33.1 6.2 52.6 6.2s31.9 15.7 27.9 35.1z" opacity=".1"/><circle cx="37.2" cy="37.2" r="37.2" fill="#ffa445"/><path fill="#ffb759" d="M63.9 11.4C57.3 5.1 48.3 1.3 38.5 1.3 18 1.3 1.3 18 1.3 38.5c0 9.9 3.9 19 10.3 25.6C4.5 57.4 0 47.8 0 37.2 0 16.6 16.6 0 37.2 0c10.5 0 20 4.4 26.7 11.4z"/><path d="M54.1 29.2l.1-2.8c.4-7.7-5.8-14-13.7-14-7.9 0-14.6 6.3-15 14l-.1 2.8h-2.7l-1.2 26H56l1.2-26h-3.1zm-23.7-2.8c.2-5.1 4.7-9.3 10-9.3s9.4 4.2 9.1 9.3l-.1 2.8H30.2l.2-2.8zm11.7 22.4H36l2.2-7.2c-1.5-.5-2.5-1.9-2.4-3.5.1-2 1.9-3.7 4-3.7s3.7 1.7 3.6 3.7c-.1 1.5-1.1 2.9-2.5 3.4l1.2 7.3z" opacity=".1"/><path fill="#fff" d="M51.3 28.6v-2.9c0-7.9-6.4-14.3-14.3-14.3s-14.3 6.4-14.3 14.3v2.9H20v26.6h34.5V28.6h-3.2zm-23.9-2.9c0-5.3 4.3-9.6 9.6-9.6s9.6 4.3 9.6 9.6v2.9H27.4v-2.9zm12.7 22.9H34l1.9-7.4c-1.5-.5-2.6-1.9-2.6-3.6 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8 0 1.6-1 2.9-2.3 3.5l1.5 7.5z"/><path fill="#e8c964" d="M51.3 28.6v-2.9c0-7.9-6.4-14.3-14.3-14.3-2 0-4 .4-5.7 1.2 1.3-.4 2.7-.6 4.2-.6 13.4-.3 16.2 16.7 12.4 16.7 0 0 .1 25.8 0 26.6h6.6V28.6h-3.2z" opacity=".15"/></svg>
    </div>
    <slot name="icon"></slot>
  </div>
  ${text}
</main>
      `;
  }
}

customElements.define('santa-error', SantaErrorElement);