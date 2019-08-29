import {html, LitElement} from 'lit-element';
import styles from './santa-chrome.css';
import * as prefix from '../lib/prefix.js';
import {_msg} from '../magic.js';

export class SantaChromeElement extends LitElement {
  static get properties() {
    return {
      navOpen: {type: Boolean},
      mini: {type: Boolean},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this._id = prefix.id();
    this.scrollScene = true;
  }

  render() {
    const sidebarId = `${this._id}sidebar`;  // unique ID even in Shady DOM
    return html`
<div class="sidebar">
  <input type="checkbox" id=${sidebarId} @change=${this._onCheckboxChange} .checked=${this.navOpen} />
  <santa-sidebar .todayHouse=${this.todayHouse} .trackerIsOpen=${this.trackerIsOpen}>
    <div class="sidebar-focuser"></div>
    <label for=${sidebarId} tabindex="0" class="closer">
<svg class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
<span>${_msg`close`}</span>
    </label>
  </santa-sidebar>
  <label class="hider" for=${sidebarId}></label>
</div>
<main @focusin=${this._onMainFocus}>
  <header class=${this.mini ? '' : 'mini'}>

    <div class="blur"></div>
    <div class="bar">
      <div class="title">
        <label for=${sidebarId} class="menu-label" tabindex="0">
          <svg class="icon"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
        </label>
        <a class="linkwrap" href="./">
          <div class="logo">Google</div> <h1>Santa Tracker</h1>
        </a>
        <div class="grow"></div>
<!--
        <countdown-timer><h2 slot="days">Days</h2><h2 slot="hours">Hrs</h2><h2 slot="minutes">Min</h2><h2 slot="seconds">Sec</h2></countdown-timer>
        <a class="trackerinfo" href="tracker.html"><h4>Current stop</h4><h4 hidden="">Next stop</h4><h3>Santa's Village, North Pole</h3></a></div></div>
-->
      </div>

  </header>
</main>
    `;
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('navOpen') && this.navOpen) {
      // Focus an element at the start of the sidebar, but then immediately
      // disallow focus. This places the browser's "cursor" here, so a keyboard
      // tab will go to the next item.
      const node = this.renderRoot.querySelector('.sidebar-focuser');
      node.setAttribute('tabindex', '0')
      node.focus();
      node.removeAttribute('tabindex');
    }
  }

  _onMainFocus() {
    this.navOpen = false;
  }

  _onCheckboxChange(ev) {
    this.navOpen = ev.target.checked;
  }
}

customElements.define('santa-chrome', SantaChromeElement);