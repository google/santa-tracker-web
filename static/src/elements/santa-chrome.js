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
<div class="sidebar" @click=${this._onSidebarClick}>
  <div class="sidebar-focuser"></div>
  <label for=${sidebarId} tabindex="0" class="closer">
    <svg class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
    <span>${_msg`close`}</span>
  </label>
  <slot name="sidebar"></slot>
</div>
<label class="hider" for=${sidebarId}></label>
<header @focusin=${this._onMainFocus}>
  <santa-button>
    <svg class="icon"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
  </santa-button>
  <fieldset class="hideable" ?disabled=${!this.action}>
    <button tabindex="0" @click=${this._onActionClick}>
      <svg class="icon">${actionInner}</svg>
    </button>
  </fieldset>
  <fieldset class="hideable" ?disabled=${!this.unmute}>
    <button tabindex="0" @click=${this._onSoundClick}>
      <svg class="icon"><svg><g fill-rule="nonzero"><path d="M4.11 10.207h4.954v3.68H4.11v-3.68zm7.843 8.08l-6.24-6.24 6.24-6.237v12.478zm4.874-1.444a.542.542 0 0 1-.337-.963c1.073-.87 1.716-2.298 1.716-3.83 0-1.53-.643-2.959-1.715-3.828a.549.549 0 0 1-.083-.764.546.546 0 0 1 .764-.082c1.323 1.073 2.118 2.823 2.118 4.675 0 1.852-.79 3.602-2.118 4.675a.54.54 0 0 1-.345.117zm-1.62-2.048a.542.542 0 0 1-.337-.963c.493-.399.79-1.06.79-1.777 0-.717-.297-1.374-.79-1.778a.542.542 0 1 1 .681-.845c.748.606 1.194 1.585 1.194 2.623 0 1.037-.446 2.016-1.194 2.623a.6.6 0 0 1-.344.117z" opacity=".7"/><path d="M19.34 3.22l1.188 1.17L4.708 20.46l-1.188-1.17L19.34 3.22zm-7.344 20.757c-3.203 0-6.21-1.25-8.472-3.512a11.902 11.902 0 0 1-3.512-8.473c0-3.202 1.249-6.21 3.512-8.472A11.902 11.902 0 0 1 11.996.008c3.203 0 6.21 1.249 8.473 3.512 4.67 4.67 4.67 12.274 0 16.945a11.896 11.896 0 0 1-8.473 3.512zm0-22.301a10.237 10.237 0 0 0-7.294 3.022 10.244 10.244 0 0 0-3.022 7.294c0 2.756 1.072 5.348 3.022 7.294a10.244 10.244 0 0 0 7.294 3.023c2.756 0 5.348-1.073 7.298-3.023 4.017-4.025 4.017-10.567 0-14.584a10.247 10.247 0 0 0-7.298-3.026z"/></g></svg>
    </button>
  </fieldset>
  <div class="grow"></div>
  <div class="hideable" ?disabled=${!this.hasScore}>
    <slot name="game"></slot>
  </div>
  <santa-countdown .until=${countdownTo}></santa-countdown>
</header>
    `;
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('navOpen')) {
      let eventName = 'nav-close';

      if (this.navOpen) {
        eventName = 'nav-open';

        // Focus an element at the start of the sidebar, but then immediately disallow focus. This
        // places the browser's "cursor" here, so a keyboard tab will go to the next item.
        const node = this.renderRoot.querySelector('.sidebar-focuser');
        node.setAttribute('tabindex', '0')
        node.focus();
        node.removeAttribute('tabindex');

        const sidebar = node.parentNode;
        sidebar.scrollTop = 0;
      }

      this.dispatchEvent(new CustomEvent(eventName));
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