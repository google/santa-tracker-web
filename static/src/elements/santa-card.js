import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-card.css';
import scenes from '../strings/scenes.js';
import {_static, _msg} from '../magic.js';
import {href} from '../scene/route.js';
import './santa-card-player.js';
import * as common from '../core/common.js';



const sceneColors = {
  boatload: '#57c4e9',
  codeboogie: '#f8c328',
  codelab: '#2a57ad',
  elfmaker: '#3399ff',
  elfski: '#93dae4',
  glider: '#7f54fa',
  gumball: '#bf8f68',
  havoc: '#587e9c',
  jamband: '#6bb4fd',
  jetpack: '#9d87f5',
  penguindash: '#93dae4',
  presentbounce: '#29b6f6',
  runner: '#2a57ad',
  santascanvas: '#1b69c1',
  santasearch: '#e7ad03',
  santaselfie: '#6bb4fd',
  seasonofgiving: '#32a658',
  snowball: '#93dae4',
  snowbox: '#1b69c1',
  speedsketch: '#32a658',
  traditions: '#93dae4',
  translations: '#32a658',
  wrapbattle: '#2a57ad',
};


export class SantaCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Number},
      scene: {type: String},
      _active: {type: Boolean},
    };
  }

  constructor() {
    super();

    this._maybeDismiss = this._maybeDismiss.bind(this);
    this._maybeMakeActive = this._maybeMakeActive.bind(this);

    this.addEventListener('focus', this._maybeMakeActive);
    this.addEventListener('blur', this._maybeDismiss);
    this.addEventListener('mouseover', this._maybeMakeActive);
    this.addEventListener('mouseout', this._maybeDismiss);
  }

  _maybeMakeActive() {
    if (this.locked && this._active) {
      return;
    }
    common.play('village_bubble_appear');
    this._active = true;
  }

  _maybeDismiss() {
    if (!this._active) {
      return;
    }
    common.play('village_bubble_disappear');
    this._active = false;
  }

  static get styles() {
    return [styles];
  }

  render() {
    let cardPlayer = '';

    if (!this.locked) {
      // TODO: might be a video
      let inner = html`<img />`;
      inner = html`<santa-card-player .active=${this._active} scene=${this.scene}></santa-card-player>`;

      cardPlayer = html`
        ${inner}
        <h1>${scenes[this.scene] || ''}</h1>
      `;
    }

    // TODO: we need an <div class="inner"> to do safe transforms
    const url = this.locked || !this.scene ? undefined : href(`${this.scene}.html`);
    const iceIndex = (this.locked || 0) % 3;  // css defines ice-[0-2]
    return html`
<main class=${this._active ? 'active' : ''}>
<a href=${ifDefined(url)} style="background-color: ${sceneColors[this.scene] || 'default'}">
  ${cardPlayer}
  <div class="ice ice-${iceIndex}" ?hidden=${!this.locked}>
    <svg width="14" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><rect fill="#FFF" fill-rule="nonzero" y="5" width="14" height="14" rx="2.8825"/><path d="M3 7V3.20903294C3 1.43673686 4.55703723 0 6.47774315 0h1.0444629C9.44287133 0 11 1.43672748 11 3.20903294V7" stroke="#FFF" stroke-width="2"/><circle fill="#C4C4C4" fill-rule="nonzero" cx="7" cy="11" r="1.5"/><path fill="#C4C4C4" fill-rule="nonzero" d="M7.83333333 11.5H6.16666667L5.5 14.5h3z"/></g></svg>
    <h3 data-text=${_msg`decmonth`}></h3>
    <h2 data-text=${this.locked || ''}></h2>
  </div>
</a>
</main>
    `;
  }
}


customElements.define('santa-card', SantaCardElement);
