import {html, svg, LitElement} from 'lit-element';
import styles from './santa-chrome.css';
import * as prefix from '../lib/prefix.js';
import './santa-button.js';
import {_msg} from '../magic.js';


const year = new Date().getFullYear();
const countdownTo = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC

const actions = {
  pause: svg`<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`,
  play: svg`<path d="M8 5v14l11-7z"/>`,
  restart: svg`<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>`,
};


export class SantaChromeElement extends LitElement {
  static get properties() {
    return {
      navOpen: {type: Boolean},
      action: {type: String},
      showHome: {type: Boolean},
      hasScore: {type: Boolean},
      unmute: {type: Boolean},
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
    const actionInner = actions[this.action || this._lastAction] || null;

    const sidebarId = `${this._id}sidebar`;  // unique ID even in Shady DOM
    return html`
<input type="checkbox" id=${sidebarId} @change=${this._onCheckboxChange} .checked=${this.navOpen} />
<div class="sidebar" @click=${this._onMenuClick}>
  <div class="sidebar-focuser"></div>
  <label for=${sidebarId} tabindex="0" class="closer">
    <svg class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
    <span>${_msg`close`}</span>
  </label>
  <slot name="sidebar"></slot>
</div>
<header @focusin=${this._onMainFocus}>
  <santa-button color="theme" @click=${this._onMenuClick}>
    <svg class="icon ${this.showHome ? 'fade' : ''}"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    <svg class="icon ${this.showHome ? '' : 'fade'}"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  </santa-button>
  <santa-button color="theme" ?disabled=${!this.action} @click=${this._onActionClick}>
    <svg class="icon">${actionInner}</svg>
  </santa-button>
  <div class="grow"></div>
  <div class="hideable" ?disabled=${!this.hasScore}>
    <slot name="game"></slot>
  </div>
  <div class="grow"></div>
  <santa-countdown .until=${countdownTo}></santa-countdown>
</header>
    `;
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('navOpen')) {
      if (this.navOpen) {
        // Focus an element at the start of the sidebar, but then immediately disallow focus. This
        // places the browser's "cursor" here, so a keyboard tab will go to the next item.
        const node = this.renderRoot.querySelector('.sidebar-focuser');
        node.setAttribute('tabindex', '0')
        node.focus();
        node.removeAttribute('tabindex');

        const sidebar = node.parentNode;
        sidebar.scrollTop = 0;
      }
    }

    if (changedProperties.has('action') && this.action) {
      // Store the last valid action so that its paths show while the transition fades out.
      this._lastAction = this.action;
    }
  }

  _onWindowBlur() {
    // Handles blue of our window, which means an iframe scene is focused.
    if (document.activeElement === document.body) {
      // .. unless it was a user hiding and showing the tab, which also fires blur
    } else {
      this.navOpen = false;
    }
  }

  _onSoundClick() {
    this.dispatchEvent(new CustomEvent('unmute'));
  }

  _onMenuClick() {
    if (this.showHome) {
      window.dispatchEvent(new CustomEvent('go'));  // home
    } else {
      this.navOpen = true;
    }
  }

  _onMainFocus() {
    // Handles focus on other parts of the Chrome: the logo and tracker information.
    this.navOpen = false;
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