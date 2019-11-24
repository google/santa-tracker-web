import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-card.css';
import scenes from '../strings/scenes.js';
import {_static, _msg} from '../magic.js';
import {href} from '../scene/route.js';
import './santa-card-player.js';
import * as common from '../core/common.js';


const assetRoot = _static`img/scenes/`;


const sceneColors = {
  boatload: '#57c4e9',
  build: '#f8c328',
  codeboogie: '#f8c328',
  codelab: '#2a57ad',
  elfmaker: '#3399ff',
  elfski: '#1b69c1',
  glider: '#7f54fa',
  gumball: '#bf8f68',
  havoc: '#587e9c',
  jamband: '#6bb4fd',
  jetpack: '#9d87f5',
  mercator: '#bf8f68',
  penguindash: '#93dae4',
  presentbounce: '#29b6f6',
  presentdrop: '#2c84db',
  runner: '#d92626',
  santascanvas: '#1b69c1',
  santasearch: '#e7ad03',
  santaselfie: '#6bb4fd',
  seasonofgiving: '#32a658',
  snowball: '#93dae4',
  snowbox: '#1b69c1',
  snowflake: '#d92626',
  speedsketch: '#32a658',
  traditions: '#93dae4',
  translations: '#32a658',
  wrapbattle: '#2a57ad',
};


const intersectionObserver = (window.IntersectionObserver ? new window.IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.load = true;
    }
  });
}) : null);


export class SantaCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Number},
      scene: {type: String},
      load: {type: Boolean},
      id: {type: String},
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

  shouldUpdate(changedProperties) {
    if (changedProperties.has('load') && this.load && intersectionObserver) {
      intersectionObserver.unobserve(this);
    }
    return true;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.load && intersectionObserver) {
      intersectionObserver.observe(this);
    } else {
      this.load = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (intersectionObserver && !this.load) {
      intersectionObserver.unobserve(this);
    }
  }

  _maybeMakeActive() {
    if (this.locked >= 0 && this._active) {
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
    const scene = this.scene || this.id || '';
    let contents = '';
    let backgroundStyle = `background-color: ${sceneColors[scene] || 'default'}`;
    const isLocked = (this.locked >= 0);

    if (!isLocked) {
      let inner = html`<img />`;

      // FIXME: config.videos() is only available in prod frame.
      if (this.load) {
        const videos = [];
        if (videos.indexOf(scene) !== -1) {
          backgroundStyle += `; background-image: url(${assetRoot}/${scene}_2x.png)`;
        } else {
          inner = html`<santa-card-player .active=${this._active} scene=${scene}></santa-card-player>`;
        }
      }

      contents = html`
        ${inner}
        <h1>${scenes[scene] || ''}</h1>
      `;
    } else {
      let inner = '';
      if (this.locked) {
        inner = html`
          <h3 data-text=${_msg`decmonth_long`}></h3>
          <h2 data-text=${this.locked}></h2>
        `;
      }
      const iceIndex = (this.locked || 0) % 3;  // css defines ice-[0-2]
      contents = html`
        <div class="ice ice-${iceIndex}" ?hidden=${!isLocked}>
          <svg width="14" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><rect fill="#FFF" fill-rule="nonzero" y="5" width="14" height="14" rx="2.8825"/><path d="M3 7V3.20903294C3 1.43673686 4.55703723 0 6.47774315 0h1.0444629C9.44287133 0 11 1.43672748 11 3.20903294V7" stroke="#FFF" stroke-width="2"/><circle fill="#C4C4C4" fill-rule="nonzero" cx="7" cy="11" r="1.5"/><path fill="#C4C4C4" fill-rule="nonzero" d="M7.83333333 11.5H6.16666667L5.5 14.5h3z"/></g></svg>
          ${inner}
        </div>
      `;
    }

    // TODO: we need an <div class="inner"> to do safe transforms (e.g. bounce anim with mouse focus)
    const url = isLocked || !scene ? undefined : href(`${scene}.html`);
    return html`
<main class=${this._active ? 'active' : ''}>
  <a href=${ifDefined(url)} style=${backgroundStyle}>${contents}</a>
</main>
    `;
  }
}


customElements.define('santa-card', SantaCardElement);
