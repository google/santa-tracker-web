import {Adapter} from '@polymer/broadway/lib/adapter';
import {html, LitElement} from 'lit-element';

import {SantaTrackerAction} from '../app/action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from '../app/common.js';
import * as prefix from '../lib/prefix.js';
import * as route from '../route.js';
import scenes from './test.json5';


export class SantaAppElement extends LitElement {
  static get properties() {
    return {
      _selectedScene: {type: String},
      _selectedData: {type: Object},
      _activeScene: {type: String},
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
      _gameover: {type: Boolean},

      _urlToLoad: {type: String},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();
    this._activeSceneInfo = {};
    this._score = {};
    this._activePort = null;

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
      this._activeScene = state.activeScene;
      this._loadAttempt = state.loadAttempt;
      this._loadProgress = state.loadProgress;
      this._showError = state.showError;
      this._showSidebar = state.showSidebar;
      this._todayHouse = state.todayHouse;
      this._score = state.score;
      this._gameover = state.gameover;

      const pendingSceneInfo = scenes[state.selectedScene] || {};
      if (pendingSceneInfo.video) {
        this._urlToLoad = route.buildIframeUrl('_video', {video: pendingSceneInfo.video});
      } else if (state.selectedScene !== null) {
        this._urlToLoad = route.buildIframeUrl(state.selectedScene);
      } else {
        this._urlToLoad = null;
      }

      this._selectedScene = state.selectedScene;
      this._selectedData = state.selectedData;
      this._activeSceneInfo = !this._showError && scenes[state.activeScene] || {};
    });
  }

  _onMainFocus(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SIDEBAR_DISMISSED});
  }

  _onLoaderLoad(ev) {
    const detail = {port: ev.detail.port};
    this._activePort = ev.detail.port;
    this.dispatchEvent(new CustomEvent('scene', {detail}));

    // nb. grab early, so the header doesn't pop in/out
    this._activeSceneInfo = scenes[this._selectedScene] || {};

    // nb. could selectedScene be racey?
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_ACTIVATED, payload: this._selectedScene});
  }

  _onLoaderPrepare(ev) {
    const send = ev.detail;
    if (this._selectedData) {
      send({type: 'data', payload: this._selectedData});
    }
  }

  _onLoaderProgress(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_LOAD_PROGRESS, payload: ev.detail});
  }

  _onLoaderError(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_FAILED, payload: ev.detail});
  }

  _onIframeScroll(ev) {
    this._iframeScroll = (ev.detail !== 0);
  }

  _onClickHome(ev) {
    const payload = {sceneName: ''};
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_SELECTED, payload});
  }

  _onClickResume(ev) {
    this._activePort && this._activePort.send('resume');
  }

  _onClickRestart(ev) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_RESTART});
    this._activePort && this._activePort.send('restart');
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

  _errorText() {
    if (!this._showError) {
      return '';
    } else if (this._showError === 'missing') {
      return _msg`error-not-found`;
    } else {
      return _msg`error-internal`;
    }
  }

  render() {
    const info = this._activeSceneInfo;
    const badge = !this._gameover && this._score || {};
    const overlayScore = (this._gameover && this._score.score || -1);
    const data = this._gameover && this._selectedData || null;

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
  <div class="overlay" ?hidden=${!this._gameover}>
    <santa-overlay
        @home=${this._onClickHome}
        @resume=${this._onClickResume}
        @restart=${this._onClickRestart}
        .scene=${this._selectedScene}
        .data=${data}
        score="${overlayScore}"></santa-overlay>
  </div>
  <header class=${this._iframeScroll ? '' : 'up'}>
    <div class="bg" style="color: ${info.color || ''}"></div>
    <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    </label>
    <a class="linkwrap" href=${route.href('./')}>
<div class="logo">Google </div><h1>${_msg`santatracker`}</h1>
    </a>
    <santa-badge style="color: ${info.featureColor || ''}"
        .level=${badge.level || 0}
        .maxLevel=${badge.maxLevel || 0}
        .score=${badge.score || 0}
        .time=${badge.time || 0}></santa-badge>
  </header>
  <div class="info noscene" ?hidden=${!this._showError && this._activeScene !== null}>
    <santa-weather></santa-weather>
    <div class="icon"></div>
    <p ?hidden=${!this._showError}>${route.resolve(this._errorText())}</p>
  </div>
  <div class="info rotate ${info.view || ''}">
    <img src="${_root`img/rotate.svg`}" />
    <p>${_msg`tilt`}</p>
  </div>
  <santa-loader
      .targetUrl="${this._urlToLoad}"
      .loadAttempt="${this._loadAttempt}"
      @prepare=${this._onLoaderPrepare}
      @progress=${this._onLoaderProgress}
      @load=${this._onLoaderLoad}
      @error=${this._onLoaderError}
      @iframe-scroll=${this._onIframeScroll}></santa-loader>
</main>
    `;
  }
}


customElements.define('santa-app', SantaAppElement);
