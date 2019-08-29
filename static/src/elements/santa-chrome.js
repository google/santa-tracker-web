import {html, LitElement} from 'lit-element';
import styles from './santa-chrome.css';
import * as prefix from '../lib/prefix.js';
import {_msg} from '../magic.js';


const year = new Date().getFullYear();
const countdownTo = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC


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
    this.mini = false;
    this.navOpen = false;
  }

  render() {
    const sidebarId = `${this._id}sidebar`;  // unique ID even in Shady DOM
    return html`
<input type="checkbox" id=${sidebarId} @change=${this._onCheckboxChange} .checked=${this.navOpen} />
<div class="sidebar">
  <div class="sidebar-focuser"></div>
  <label for=${sidebarId} tabindex="0" class="closer">
    <svg class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
    <span>${_msg`close`}</span>
  </label>
  <slot name="sidebar"></slot>
</div>
<label class="hider" for=${sidebarId}></label>
<main @focusin=${this._onMainFocus}>
  <header class=${this.mini ? '' : 'mini'}>
    <div class="blur"></div>
    <div class="bar">
      <div class="title">
        <label for=${sidebarId} class="menu-label" tabindex="0">
          <svg class="icon"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
        </label>
        <a class="linkwrap" href="./">
          <svg class="logo"><path d="M7.74363885 18.01859504v2.03305785h4.98714095c-.1526676 1.14049591-.5428181 1.97520661-1.1365254 2.56198351-.7294117.7107438-1.86593703 1.4876033-3.85061555 1.4876033-3.07031464 0-5.47058823-2.4132232-5.47058823-5.40495871 0-2.99173554 2.40027359-5.40495868 5.47058823-5.40495868 1.65389877 0 2.86675785.63636364 3.75731875 1.45454546l1.4673051-1.42975207C11.729959 12.14256198 10.0675787 11.25 7.74363885 11.25 3.53679891 11.25 0 14.58884298 0 18.68801653c0 4.09917357 3.53679891 7.43801657 7.74363885 7.43801657 2.27305065 0 3.98632015-.7272728 5.32640215-2.0826447 1.3740082-1.3388429 1.8065664-3.2314049 1.8065664-4.75206609 0-.47107438-.0339261-.90909091-.1102599-1.27272727H7.74363885zm13.36689465-1.65289256c-2.7225718 0-4.9447332 2.01652892-4.9447332 4.80165292 0 2.7603306 2.2221614 4.8016529 4.9447332 4.8016529s4.9447333-2.0330579 4.9447333-4.8016529c0-2.785124-2.2221615-4.80165292-4.9447333-4.80165292zm0 7.71074382c-1.4927496 0-2.7819425-1.1983471-2.7819425-2.9090909 0-1.72727276 1.2891929-2.90909094 2.7819425-2.90909094 1.4927497 0 2.7819426 1.18181818 2.7819426 2.90909094 0 1.7107438-1.2891929 2.9090909-2.7819426 2.9090909zm24.2402189-6.63636366h-.0763338c-.4834473-.56198347-1.4164159-1.07438016-2.5953488-1.07438016-2.4596444 0-4.605472 2.09090909-4.605472 4.80165292 0 2.6942148 2.1458276 4.8016529 4.605472 4.8016529 1.1789329 0 2.1119015-.5123967 2.5953488-1.0909091h.0763338v.6694215c0 1.8347107-1.0093023 2.8181818-2.629275 2.8181818-1.323119 0-2.1458276-.9256199-2.4850889-1.7107438l-1.8829001.7603306c.542818 1.2727272 1.976197 2.8347107 4.367989 2.8347107 2.5359781 0 4.6818058-1.4545455 4.6818058-5v-8.63636364h-2.0525308v.82644628zm-2.4850889 6.63636366c-1.4927497 0-2.629275-1.2396694-2.629275-2.9090909 0-1.6942149 1.1365253-2.90909094 2.629275-2.90909094 1.4757866 0 2.6292749 1.23966942 2.6292749 2.92561984.0084816 1.6776859-1.1534883 2.892562-2.6292749 2.892562zm-10.7291382-7.71074382c-2.7225718 0-4.9447332 2.01652892-4.9447332 4.80165292 0 2.7603306 2.2221614 4.8016529 4.9447332 4.8016529s4.9447332-2.0330579 4.9447332-4.8016529c0-2.785124-2.2221614-4.80165292-4.9447332-4.80165292zm0 7.71074382c-1.4927497 0-2.7819425-1.1983471-2.7819425-2.9090909 0-1.72727276 1.2891928-2.90909094 2.7819425-2.90909094s2.7819426 1.18181818 2.7819426 2.90909094c0 1.7107438-1.2891929 2.9090909-2.7819426 2.9090909zm16.9630643-12.6280992h2.1288646v14.5206612h-2.1288646V11.4483471zm8.702052 12.6280992c-1.1025992 0-1.8829001-.4876033-2.3917921-1.4545455L62 19.96900826l-.2205198-.54545454c-.4071136-1.07438017-1.6623803-3.05785124-4.2153215-3.05785124-2.5359781 0-4.6478796 1.94214876-4.6478796 4.80165292 0 2.6942148 2.0864569 4.8016529 4.8853625 4.8016529 2.2560875 0 3.5622435-1.3471075 4.1050615-2.123967l-1.6793433-1.0909091c-.5597811.7933885-1.323119 1.3223141-2.4257182 1.3223141zm-.1526676-5.90909093c.8735978 0 1.6199726.43801653 1.8659371 1.05785124L55.0621067 21.018595c0-2.01652888 1.4673051-2.85123963 2.5868673-2.85123963z"/></svg>
          <h1><span class="a11y">Google</span> Santa Tracker</h1>
        </a>
        <div class="grow"></div>
        <santa-countdown .until=${countdownTo}></santa-countdown>
<!--
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