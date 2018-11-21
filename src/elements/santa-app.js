import {Adapter} from '@polymer/broadway/lib/adapter';
import {html, LitElement} from '@polymer/lit-element';

import {SantaTrackerAction} from '../app/action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from '../app/common.js';
import * as prefix from '../lib/prefix.js';
import * as route from '../route.js';
import scenes from '../../scenes.json5.js';


export class SantaAppElement extends LitElement {
  static get properties() {
    return {
      _activeScene: {type: String},
      _selectedScene: {type: String},
      _loadAttempt: {type: Number},
      _loadProgress: {type: Number},
      _showError: {type: Boolean},
      _showSidebar: {type: Boolean},
      _todayHouse: {type: String},
      _trackerIsOpen: {type: Boolean},
      _iframeScroll: {type: Boolean},
      _idPrefix: {type: String},
      _activeSceneInfo: {type: Object},
      _score: {type: Object},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();
    this._activeSceneInfo = {};

    // TODO(samthor): This could be part of global state.
    this._loaderSuffix = '';
    if (document.documentElement.lang) {
      this._loaderSuffix = `${document.documentElement.lang}.html`;
    }

    this.shadowRoot.addEventListener('keydown', (ev) => {
      const t = ev.target;

      // Handle 'Enter' on a focusable <label> element.
      if (ev.key === 'Enter' && t.localName === 'label' && t.getAttribute('for')) {
        ev.preventDefault();
        t.click();
      }
    });

    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);
    this.adapter.subscribe((state) => {
      this._selectedScene = state.selectedScene;
      this._activeScene = state.activeScene;
      this._loadAttempt = state.loadAttempt;
      this._loadProgress = state.loadProgress;
      this._showError = state.showError;
      this._showSidebar = state.showSidebar;
      this._todayHouse = state.todayHouse;
      this._score = state.score;

      this._activeSceneInfo = !this._showError && scenes[state.activeScene] || {};
    });
  }

  _onMainFocus(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SIDEBAR_DISMISSED});
  }

  _onLoaderLoad(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_ACTIVATED, payload: ev.detail});
  }

  _onLoaderProgress(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_LOAD_PROGRESS, payload: ev.detail});
  }

  _onLoaderError(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_FAILED});
  }

  _onIframeScroll(ev) {
    this._iframeScroll = (ev.detail !== 0);
  }

  _onCheckboxChange(ev) {
    // nb. This is basically two-way binding to the <input type="checkbox">, but
    // as it is being used to control sidebar visibility, the binding seems
    // warranted.
    this.adapter.dispatch({
      type: ev.target.checked ? SantaTrackerAction.SIDEBAR_REQUESTED :
                                SantaTrackerAction.SIDEBAR_DISMISSED
    });
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('_showSidebar') && this._showSidebar) {
      // Focus an element at the start of the sidebar, but then immediately
      // disallow focus. This places the browser's "cursor" here, so a keyboard
      // tab will go to the next item.
      const node = this.shadowRoot.querySelector('.sidebar-focuser');
      node.setAttribute('tabindex', '0')
      node.focus();
      node.removeAttribute('tabindex');
    }
  }

  render() {
    const info = this._activeSceneInfo;
    const score = this._score || {};
    return html`
<style>${_style`santa-app`}</style>
<div class="preload" ?hidden=${this._loadProgress === 1}>
  <div class="bar" style="width: ${this._loadProgress * 100}%"></div>
</div>
<div class="sidebar">
  <input type="checkbox" id="${this._idPrefix}sidebar" @change=${this._onCheckboxChange} .checked=${
        this._showSidebar} />
  <santa-sidebar .todayHouse=${this._todayHouse} .trackerIsOpen=${this._trackerIsOpen}>
    <div class="closer">
      <div class="sidebar-focuser"></div>
      <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
      </label>
    </div>
  </santa-sidebar>
  <label class="hider" for="${this._idPrefix}sidebar"></label>
</div>
<main @focusin=${this._onMainFocus} class=${info.scroll ? 'scroll' : ''}>
  <header class=${this._iframeScroll ? '' : 'up'}>
    <div class="bg" style="color: ${info.color || ''}"></div>
    <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    </label>
    <a class="linkwrap" href=${route.href('./')}>
<div class="logo">Google </div><h1>${_msg`santatracker`}</h1>
    </a>
    <santa-badge style="color: ${info.featureColor || ''}"
        .level=${score.level || 0}
        .maxLevel=${score.maxLevel || 0}
        .score=${score.score || 0}
        .time=${score.time || 0}></santa-badge>
  </header>
  <div class="info noscene" ?hidden=${!this._showError && this._activeScene !== null}>
    <santa-weather></santa-weather>
    <div class="icon"></div>
    <p ?hidden=${!this._showError}>${route.resolve(_msg`error-not-found`)}</p>
  </div>
  <div class="info rotate ${info.view || ''}">
    <img src="img/rotate.svg" />
    <p>${_msg`tilt`}</p>
  </div>
  <santa-loader
      .selectedScene="${this._selectedScene}"
      .loadAttempt="${this._loadAttempt}"
      .loaderSuffix="${this._loaderSuffix}"
      @progress=${this._onLoaderProgress}
      @load=${this._onLoaderLoad}
      @error=${this._onLoaderError}
      @iframe-scroll=${this._onIframeScroll}></santa-loader>
</main>
    `;
  }
}


customElements.define('santa-app', SantaAppElement);
