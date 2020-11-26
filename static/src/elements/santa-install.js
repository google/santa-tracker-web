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
import {_msg} from '../magic.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import styles from './santa-install.css';


const instances = new Set();
const isIos = ('standalone' in navigator) && !navigator.standalone;  // we're "not" ios when installed
let installEvent = window.installEvent;  // saved from loader

function notifyInstances() {
  instances.forEach((instance) => instance._update());
}


window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installEvent = event;
  notifyInstances();
  window.ga('send', 'event', 'app', 'beforeinstallprompt');
  console.info('beforeinstallprompt');
});


window.addEventListener('appinstalled', () => {
  installEvent = null;
  notifyInstances();
  window.ga('send', 'event', 'app', 'appinstalled');
  console.info('appinstalled');
});


class SantaInstallElement extends LitElement {
  static get properties() {
    return {
      ready: {type: Boolean, reflect: true},
      _iosInfoOpen: {type: Boolean},
    };
  }

  static get styles() { return [styles]; }

  _update() {
    this.ready = (isIos || installEvent);
  }

  connectedCallback() {
    super.connectedCallback();
    instances.add(this);
    this._update();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    instances.delete(this);
  }

  _onTriggerInstall(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!installEvent) {
      if (isIos) {
        window.ga('send', 'event', 'nav', 'click', 'install-ios');
      }
      event.target.focus();  // Safari doesn't focus <button> by default
      return;  // this can happen on iOS, when clicking does nothing
    }

    installEvent.prompt();
    window.ga('send', 'event', 'nav', 'click', 'install');

    const savedEvent = installEvent;
    Promise.resolve(installEvent.userChoice || 'unknown').then((choiceResult) => {
      if (savedEvent === installEvent) {
        // can't re-use this after making a choice
        installEvent = null;
        notifyInstances();
      }
      window.ga('send', 'event', 'app', 'install', choiceResult);
    });
  }

  _onBlurInstall() {
    this.blur();
  }

  render() {
    let panel = '';
    if (isIos) {
      panel = html`
<div id="lower" @click=${this._onBlurInstall}>
<main>
  <h2>${_msg`village_santa_install`}</h2>
  <p class="cta">${unsafeHTML(_msg`village_santa_intall_ios`)}</p>
</main>
</div>
      `;
    }

    return html`
<button id="install" ?disabled=${!this.ready} @click=${this._onTriggerInstall}>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="7.4" stroke="white" stroke-width="1.2"/>
    <path d="M8.59993 3.19995C8.59993 2.86858 8.3313 2.59995 7.99993 2.59995C7.66856 2.59995 7.39993 2.86858 7.39993 3.19995H8.59993ZM7.99993 12.16L7.57567 12.5842C7.80998 12.8185 8.18988 12.8185 8.4242 12.5842L7.99993 12.16ZM5.5442 8.85569C5.30988 8.62137 4.92998 8.62137 4.69567 8.85569C4.46136 9.09 4.46136 9.4699 4.69567 9.70422L5.5442 8.85569ZM11.3042 9.70422C11.5385 9.4699 11.5385 9.09 11.3042 8.85569C11.0699 8.62137 10.69 8.62137 10.4557 8.85569L11.3042 9.70422ZM7.39993 3.19995V12.16H8.59993V3.19995H7.39993ZM4.69567 9.70422L7.57567 12.5842L8.4242 11.7357L5.5442 8.85569L4.69567 9.70422ZM8.4242 12.5842L11.3042 9.70422L10.4557 8.85569L7.57567 11.7357L8.4242 12.5842Z" fill="white"/>
  </svg>
  <span>${_msg`village_santa_install`}</span>
  ${panel}
</button>
    `;
  }
}

customElements.define('santa-install', SantaInstallElement);
