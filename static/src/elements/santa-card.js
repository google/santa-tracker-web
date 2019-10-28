import {html, LitElement} from 'lit-element';
import {until} from 'lit-html/directives/until.js';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-card.css';
import scenes from '../strings/scenes.js';
import {_static, _msg} from '../magic.js';
import {prepareAsset} from '../lib/media.js';
import {href} from '../scene/route.js';
import loadLottie from '../deps/lottie.js';
import './santa-card-player.js';

// YouTube video assets for previews.
export const videos = {
  carpool: 'h83b1lWPuvQ',
  comroom: '_WdYujHlmHA',
  jingle: 'sQnKCU_A0Yc',
  liftoff: 'BfF7vfw6Zjw',  // 2013
  museum: 'fo25RcjXJI4',
  office: 'IXmDOu-eSx4',
  onvacation: 'IdpQSy4IB_I',
  penguinproof: 'QKm4q6kZK7E',
  reindeerworries: 'nXLNcfNsWAY',  // 2015
  reload: 'vHMeXs36NTE',
  santasback: 'zE_D9Vd69aw',
  satellite: 'ZJPL56IPTjw',
  selfies: 'JA8Jn5DGt64',
  slackingoff: 'uEl2WIZOVdQ',
  takeoff: 'YNpwm08ZRD0',  // 2015+, coding
  temptation: '2FtcJJ9vzVQ',
  tired: '2UGX3bT9u20',
  wheressanta: '0qrFL0mn3Uk',  // 2013
  workshop: 'oCAKV4Ikhec',  // 2014
};


const sceneColors = {
  boatload: '#57c4e9',
  codeboogie: '#f8c328',
  codelab: '#2a57ad',
  elfmaker: '#3399ff',
  elfski: '#c1e8ed',
  glider: '#7f54fa',
  gumball: '#bf8f68',
  jamband: '#6bb4fd',
  jetpack: '#9d87f5',
  penguindash: '#93dae4',
  presentbounce: '#29b6f6',
  runner: '#2a57ad',
  santascanvas: '#1b69c1',
  santasearch: '#ffe475',
  santaselfie: '#6bb4fd',
  seasonofgiving: '#32a658',
  snowball: '#93dae4',
  speedsketch: '#32a658',
  traditions: '#93dae4',
  translations: '#6bc86e',
  wrapbattle: '#2a57ad',
};


const alreadyResolved = Promise.resolve();


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
    this._backgroundStylePromise = alreadyResolved;

    this.addEventListener('mouseover', () => {
      this._active = true;
    });
    this.addEventListener('mouseout', (ev) => {
      this._active = false;
    });
  }

  static get styles() {
    return [styles];
  }

  shouldUpdate(changedProperties) {
    if (!changedProperties.has('scene') && !changedProperties.has('locked')) {
      return true;
    }

    if (!this.scene) {
      this._backgroundStylePromise = alreadyResolved;
      return true;
    }

    // Check if this is secretly a video.
    if (this.scene in videos) {
      const videoId = videos[this.scene];
      const url = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

      const {promise} = prepareAsset(url);

      this._backgroundStylePromise = promise.then(() => {
        return `background-image: url(${url})`;
      });

      return true;
    }

    const color = sceneColors[this.scene];
    if (color) {
      this._backgroundStylePromise = Promise.resolve(`background: ${color}`);
    } else {
      this._backgroundStylePromise = alreadyResolved;
    }

    return true;
}

  render() {
    const lottiePath = _static`img/card-lottie/`;
    let cardPlayer = '';

    if (!this.locked) {
      cardPlayer = html`
        <santa-card-player .active=${this._active} intro-src=${lottiePath + this.scene + '-intro.json'} loop-src=${lottiePath + this.scene + '-loop.json'}></santa-card-player>
        <h1>${scenes[this.scene] || ''}</h1>
      `;
    }

    const url = this.locked || !this.scene ? undefined : href(`${this.scene}.html`);
    const iceIndex = (this.locked || 0) % 3;  // css defines ice-[0-2]
    return html`
<main>
<a href=${ifDefined(url)} style=${ifDefined(until(this._backgroundStylePromise, ''))}>
  ${cardPlayer}
  <div class="ice ice-${iceIndex}" ?hidden=${!this.locked}>
    <svg width="14" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><rect fill="#FFF" fill-rule="nonzero" y="5" width="14" height="14" rx="2.8825"/><path d="M3 7V3.20903294C3 1.43673686 4.55703723 0 6.47774315 0h1.0444629C9.44287133 0 11 1.43672748 11 3.20903294V7" stroke="#FFF" stroke-width="2"/><circle fill="#C4C4C4" fill-rule="nonzero" cx="7" cy="11" r="1.5"/><path fill="#C4C4C4" fill-rule="nonzero" d="M7.83333333 11.5H6.16666667L5.5 14.5h3z"/></g></svg>
    <h3 data-text=${_msg`opens`}></h3>
    <h2 data-text=${this.locked || ''}></h2>
  </div>
</a>
</main>
    `;
  }
}


customElements.define('santa-card', SantaCardElement);