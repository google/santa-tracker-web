import {Adapter} from '@polymer/broadway/lib/adapter';
import {html, LitElement} from '@polymer/lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

import {SantaTrackerAction} from '../app/action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from '../app/common.js';
import * as prefix from '../lib/prefix.js';


function sceneIsScroll(sceneName) {
  return !sceneName || sceneName === 'village';
}


function colorForScene(sceneName) {
  return sceneName === 'boatload' ? '#fdbe27' : '';
}


function featureColorForScene(sceneName) {
  return sceneName === 'boatload' ? '#003799' : '';
}


export class SantaAppElement extends LitElement {
  static get properties() {
    return {
      _activeScene: {type: String},
      _selectedScene: {type: String},
      _showError: {type: Boolean},
      _todayHouse: {type: String},
      _trackerIsOpen: {type: Boolean},
      _sidebarOpen: {type: Boolean},
      _iframeScroll: {type: Boolean},
      _progress: {type: Number},
      _idPrefix: {type: String},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();

    // Handle 'Enter' on a focusable <label> element.
    this.shadowRoot.addEventListener('keydown', (ev) => {
      const t = ev.target;
      if (ev.key === 'Enter' && t.localName === 'label' && t.getAttribute('for')) {
        ev.preventDefault();
        t.click();
      }
    });

    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);
    this.adapter.subscribe((state) => {
      this._sidebarOpen = state.showSidebar;
      this._todayHouse = state.todayHouse;

      this._activeScene = state.activeScene;
      this._progress = state.loadProgress;
      this._selectedScene = state.selectedScene;
      this._showError = state.showError;
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

    if (changedProperties.has('sidebarOpen') && this.sidebarOpen) {
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
    return html`
<style>${_style`santa-app`}</style>
<div class="preload" ?hidden=${this._progress === 1}>
  <div class="bar" style="width: ${this._progress * 100}%"></div>
</div>
<div class="sidebar">
  <input type="checkbox" id="${this._idPrefix}sidebar" @change=${this._onCheckboxChange} .checked=${
        this._sidebarOpen} />
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
<main @focusin=${this._onMainFocus} class=${sceneIsScroll(this._activeScene) ? 'scroll' : ''}>
  <header class=${this._iframeScroll ? '' : 'up'}>
    <div class="bg" style="color: ${colorForScene(this._activeScene)}"></div>
    <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    </label>
    <a class="linkwrap" href="./">
<div class="logo">Google </div><h1>${_msg`santatracker`}</h1>
    </a>
    <santa-badge style="color: ${featureColorForScene(this._activeScene)}"></santa-badge>
  </header>
  <div class="noscene" ?hidden=${!this._showError && this._activeScene !== null}>
    <santa-weather></santa-weather>
    <div class="icon"></div>
    <p ?hidden=${!this._showError}>${unsafeHTML(_msg`error-not-found`)}</p>
  </div>
  <santa-loader
      .selectedScene="${this._selectedScene}"
      @progress=${this._onLoaderProgress}
      @load=${this._onLoaderLoad}
      @error=${this._onLoaderError}
      @iframe-scroll=${this._onIframeScroll}></santa-loader>
</main>
    `;
  }
}


customElements.define('santa-app', SantaAppElement);
