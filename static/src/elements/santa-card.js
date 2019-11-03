import {html, LitElement} from 'lit-element';
import {until} from 'lit-html/directives/until.js';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-card.css';
import scenes from '../strings/scenes.js';
import {_static, _msg} from '../magic.js';
import {prepareAsset} from '../lib/media.js';
import {href} from '../scene/route.js';
import {join} from '../lib/url.js';
import './santa-card-player.js';


const sceneDefs = {
  boatload: {
    color: '#57c4e9',
    mode: 'static',
  },
  elfmaker: {
    color: '#3399ff',
    mode: 'lottie-both',
  },
  penguindash: {
    color: '#93dae4',
    mode: 'lottie',
  },
  santasearch: {
    color: '#ff3475',
    mode: 'lottie',
  },
  santaselfie: {
    color: '#6bb4fd',
    mode: 'lottie',
  },
  snowball: {
    color: '#93dae4',
    mode: 'lottie',
  },
  museum: {
    mode: 'video',
  },
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
    const detail = 'village_bubble_appear';
    window.dispatchEvent(new CustomEvent('sound-trigger', {detail}));
    this._active = true;
  }

  _maybeDismiss() {
    if (!this._active) {
      return;
    }
    const detail = 'village_bubble_disappear';
    window.dispatchEvent(new CustomEvent('sound-trigger', {detail}));
    this._active = false;
}

  static get styles() {
    return [styles];
  }

  shouldUpdate(changedProperties) {
    if (!changedProperties.has('scene') && !changedProperties.has('locked')) {
      return true;
    }

    const def = sceneDefs[this.scene];
    this._backgroundStylePromise = def && this._prepareBackground(def, this.scene) || alreadyResolved;
    return true;
  }

  _prepareBackground(def, scene) {
    if (def.color) {
      return Promise.resolve(`background: ${def.color}`);
    } else if (def.mode === 'video') {
      const url = join(import.meta.url, '../../img/scenes/' + scene + '_1x.png');
      const {promise} = prepareAsset(url);

      return promise.then(() => {
        return `background-image: url(${url})`;
      });
    }
  }

  render() {
    const cardPath = _static`img/card/`;
    let cardPlayer = '';

    if (!this.locked) {
      let inner = html`<img />`;
      const def = sceneDefs[this.scene];
      if (def && (def.mode === 'lottie' || def.mode === 'lottie-both')) {
        inner = html`<santa-card-player .active=${this._active} intro-src=${cardPath + this.scene + '-intro.json'} loop-src=${cardPath + this.scene + '-loop.json'}></santa-card-player>`;
      } else if (def && def.mode === 'static') {
        inner = html`<img src=${cardPath + this.scene + '.svg'} />`;
      }

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