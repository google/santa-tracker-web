import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-card.css';
import scenes from '../strings/scenes.js';
import {_static, _msg} from '../magic.js';
import {hrefForScene} from '../scene/route.js';
import {SantaCardPlayerElement} from './santa-card-player.js';
import * as common from '../core/common.js';


// This doubles as the list of assets for which we have Lottie cards.
const scenesWithColor = {
  boatload: '#57c4e9',
  build: '#f8c328',
  codeboogie: '#f8c328',
  codelab: '#2a57ad',
  elfmaker: '#3399ff',
  elfski: '#1b69c1',
  glider: '#7f54fa',
  // gumball: '#bf8f68',
  havoc: '#587e9c',
  jamband: '#6bb4fd',
  jetpack: '#9d87f5',
  mercator: '#bf8f68',
  penguindash: '#93dae4',
  // presentbounce: '#29b6f6',
  presentdrop: '#2c84db',
  racer: '#2a57ad',
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
  '@penguinswim': '#079aad',
  '@rocketsleigh': '#9d87f5',
  '@dasherdancer': '#6bb4fd',
  '@snowballrun': '#93dae4',
  '@presenttoss': '#6f00ff',
  '@cityquiz': '#e7ad03',
};


const intersectionObserver = (window.IntersectionObserver ? new window.IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target._visible = entry.isIntersecting;
  });
}, {rootMargin: '128px'}) : null);


export class SantaCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Number, reflect: true},
      scene: {type: String, reflect: true},
      id: {type: String, reflect: true},
      featured: {type: Boolean, reflect: true},

      _visible: {type: Boolean},
      _active: {type: Boolean},
      _assetNode: {type: Object},
      _assetLoaded: {type: Boolean},
    };
  }

  constructor() {
    super();

    this._visible = !intersectionObserver;  // always _visible if there's no IntersectionObserver
    this._assetNode = '';
    this._assetLoaded = false;
    this._active = false;
    this._maybeDismiss = this._maybeDismiss.bind(this);
    this._maybeMakeActive = this._maybeMakeActive.bind(this);

    this.addEventListener('focus', this._maybeMakeActive);
    this.addEventListener('blur', this._maybeDismiss);
    this.addEventListener('mouseover', this._maybeMakeActive);
    this.addEventListener('mouseout', this._maybeDismiss);
  }

  _buildAsset() {
    const scene = this.scene || this.id || '';

    // This assets that we have a Lottie card.
    if (scene in scenesWithColor) {
      const player = Object.assign(document.createElement('santa-card-player'), {
        scene,
        _active: this._active,
      });

      player.addEventListener('error', () => {
        player.scene = '_generic';
      }, {once: true})

      return player;
    }

    const img = document.createElement('img');
    if (!scene) {
      // Use a custom icon for "Santa's Village".
      img.src = _static`img/og.png`;
    } else {
      // Otherwise, fallback to our old backgrounds.
      img.src = _static`img/scenes/` + `${scene}_2x.png`;
      img.srcset = `${img.src} 2x, ${_static`img/scenes/`}` + `${scene}_1x.png`;
    }

    img.addEventListener('error', () => {
      img.src = _static`img/unknown.png`;
      img.removeAttribute('srcset');
    }, {once: true});

    return img;
  }

  _refreshAsset() {
    const localNode = this._buildAsset();
    this._assetNode = localNode;
    this._assetLoaded = false;

    // Install a load handler so it can fade in nicely.
    localNode.addEventListener('load', () => {
      if (localNode === this._assetNode) {
        this._assetLoaded = true;
      }
    });
  }

  shouldUpdate(changedProperties) {
    const idChanged = changedProperties.has('id') || changedProperties.has('scene');
    if (idChanged) {
      this._assetLoaded = false;
    }
    if (this._visible && !this._assetLoaded) {
      this._refreshAsset();
    }

    if (changedProperties.has('_active')) {
      if (this._assetNode instanceof SantaCardPlayerElement) {
        this._assetNode.active = this._active;
      }
    }

    return true;
  }

  connectedCallback() {
    super.connectedCallback();
    intersectionObserver && intersectionObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    intersectionObserver && intersectionObserver.unobserve(this);
  }

  _maybeMakeActive() {
    if (this.locked >= 0 || this._active) {
      return;
    }
    common.play('menu_over', this.scene || this.id || '');
    
    this._active = true;
  }

  _maybeDismiss() {
    if (!this._active) {
      return;
    }
    common.play('menu_out');
    this._active = false;
  }

  static get styles() {
    return [styles];
  }

  get isLocked() {
    return this.locked != null && this.locked >= 0;
  }

  render() {
    const scene = this.scene || this.id || '';
    const isLocked = this.isLocked;
    const background = (this._assetNode instanceof HTMLImageElement);
    const mainStyle = scene in scenesWithColor ? `--color: ${scenesWithColor[scene]}` : '';

    let text = '';
    if (isLocked) {
      text = html`
<svg width="14" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><rect fill="#FFF" fill-rule="nonzero" y="5" width="14" height="14" rx="2.8825"/><path d="M3 7V3.20903294C3 1.43673686 4.55703723 0 6.47774315 0h1.0444629C9.44287133 0 11 1.43672748 11 3.20903294V7" stroke="#FFF" stroke-width="2"/><circle fill="#C4C4C4" fill-rule="nonzero" cx="7" cy="11" r="1.5"/><path fill="#C4C4C4" fill-rule="nonzero" d="M7.83333333 11.5H6.16666667L5.5 14.5h3z"/></g></svg>
<h3>${_msg`decmonth_long`}</h3>
<h2>${this.locked || ''}</h2>
      `;
    } else if (scenes[scene]) {
      text = html`<h1>${scenes[scene]}</h1>`;
    }

    return html`
<a href=${ifDefined(isLocked ? undefined : hrefForScene(scene))} class=${isLocked ? 'locked' : ''}>
  <main class=${isLocked ? `ice-${(this.locked || 0) % 3}` : ''} style=${mainStyle}>
    <div class="asset ${background ? 'background': ''} ${this._assetLoaded ? 'loaded' : ''}">
      ${this._assetNode}
    </div>
    <div class="text">${text}</div>
  </main>
</a>
    `;
  }
}


customElements.define('santa-card', SantaCardElement);
