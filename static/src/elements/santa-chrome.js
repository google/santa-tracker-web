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
import styles from './santa-chrome.css';
import * as prefix from '../lib/prefix.js';
import './santa-button.js';
import * as common from '../core/common.js';
import {_msg} from '../magic.js';
import isAndroid from '../core/android.js';


const year = new Date().getFullYear();
const countdownTo = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC


const paths = {
  pause: `M6 19h4V5H6v14zm8-14v14h4V5h-4z`,
  play: `M8 5v14l11-7z`,
  restart: `M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z`,
  menu: `M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z`,
  home: `M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`,
  unmute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  mute: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
};


const labels = {
  pause: _msg`pause`,
  play: _msg`play`,
  restart: _msg`playagain`,
  menu: _msg`category_all`,
  home: _msg`santasvillage`,
  unmute: _msg`unmute`,
  mute: _msg`mute`,
};


export class SantaChromeElement extends LitElement {
  static get properties() {
    return {
      navOpen: {type: Boolean},
      action: {type: String},
      showHome: {type: Boolean},
      hasScore: {type: Boolean},
      muted: {type: Boolean},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this._lastAction = '';
    this._id = prefix.id();
    this.navOpen = false;
    this.action = null;

    this._onWindowBlur = this._onWindowBlur.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('blur', this._onWindowBlur);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('blur', this._onWindowBlur);
  }

  render() {
    const sidebarId = `${this._id}sidebar`;  // unique ID even in Shady DOM

    // Either "Santa's Village" for the home button, or "View All" for all games.
    const labelForMenu = this.showHome ? labels.home : labels.menu;
    const labelForAudio = this.muted ? labels.mute : labels.unmute;
    const labelForAction = labels[this.action] || ''

    return html`
<input type="checkbox" id=${sidebarId} @change=${this._onCheckboxChange} .checked=${this.navOpen} />
<div class="sidebar">
  <div class="sidebar-focuser"></div>
  <slot name="sidebar"></slot>
</div>
<div id="padder">
  <header>
    <santa-button aria-label=${labelForMenu} @click=${this._onMenuClick} path=${this.showHome ? paths.home : paths.menu}></santa-button>
    <santa-button .hidden=${isAndroid()} aria-label=${labelForAudio} color=${this.muted ? 'purple' : ''} @click=${this._onAudioClick} path=${this.muted ? paths.unmute : paths.mute}></santa-button>
    <santa-button aria-label=${labelForAction} ?disabled=${!this.action} @click=${this._onActionClick} path=${paths[this.action || this._lastAction] || ''}></santa-button>
    <div class="grow"></div>
    <div><slot name="game"></slot></div>
    <div class="grow"></div>
    <santa-countdown .until=${countdownTo}></santa-countdown>
    <div id="active-fixer"></div>
  </header>
</div>
    `;
  }

  update(changedProperties) {
    super.update(changedProperties);
    let soundEvent = 'nav_close';
    if (changedProperties.has('navOpen')) {
      if (this.navOpen) {
        soundEvent = 'nav_open';
        // Focus an element at the start of the sidebar, but then immediately disallow focus. This
        // places the browser's "cursor" here, so a keyboard tab will go to the next item.
        const node = this.renderRoot.querySelector('.sidebar-focuser');
        node.setAttribute('tabindex', '0')
        node.focus();
        node.removeAttribute('tabindex');

        this.dispatchEvent(new CustomEvent('sidebar-open'));

        const sidebar = node.parentNode;
        sidebar.scrollTop = 0;
      }
    }
    common.play(soundEvent);
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('action') && !this.action) {
      // Store the last valid action so that its paths show while the transition fades out.
      this._lastAction = changedProperties.get('action');
    }
    return super.shouldUpdate(changedProperties);
  }

  _onWindowBlur() {
    // Handles blue of our window, which means an iframe scene is focused.
    if (document.activeElement === document.body) {
      // .. unless it was a user hiding and showing the tab, which also fires blur
    } else if (document.activeElement !== null) {
      if (document.activeElement.localName === 'santa-gameloader') {
        this.navOpen = false;
      }
    }
  }

  _onAudioClick() {
    window.ga('send', 'event', 'nav', 'click', this.muted ? 'unmute' : 'mute');
    this.dispatchEvent(new CustomEvent('audio', {detail: this.muted}));
  }

  _onMenuClick() {
    if (this.showHome) {
      window.ga('send', 'event', 'nav', 'click', 'home');
      window.dispatchEvent(new CustomEvent(common.goEvent));  // home
    } else {
      window.ga('send', 'event', 'nav', 'click', 'menu');
      this.navOpen = !this.navOpen;
    }
  }

  _onSidebarClick(e) {
    // The click event doesn't bubble, but we can check to see whether it was prevented by the next
    // frame. If so, the entrypoint code caused the URL to change, so close the sidebar.
    window.setTimeout(() => {
      if (e.defaultPrevented) {
        this.navOpen = false;
      }
    }, 0);
  }


  _onActionClick(e) {
    window.ga('send', 'event', 'nav', 'click', this.action);
    this.dispatchEvent(new CustomEvent('action', {
      detail: this.action,
      bubbles: true,
    }));
  }

  _onCheckboxChange(e) {
    this.navOpen = e.target.checked;
  }
}

customElements.define('santa-chrome', SantaChromeElement);