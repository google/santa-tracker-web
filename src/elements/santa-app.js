import {LitElement, html} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

import {_msg, _style, runtimeTranslate, getLanguage, localizeUrl} from '../lib/runtime.js';
import {findClosestLink} from '../lib/dom.js';


function sceneIsScroll(sceneName) {
  return !sceneName || sceneName === 'village';
}


function colorForScene(sceneName) {
  return sceneName === 'boatload' ? '#fdbe27' : '';
}


export class SantaAppElement extends LitElement {
  static get properties() {
    return {
      todayHouse: {type: String},
      trackerIsOpen: {type: Boolean},
      _iframeScroll: {type: Boolean},
      _sceneName: {type: String},  // actually loaded scene (not in progress)
      _progress: {type: Number},
      _idPrefix: {type: String},
    };
  }

  constructor() {
    super();
    this._idPrefix = `_${Math.random().toString(16).slice(2)}_`;

    this.addEventListener('click', this._onClick);
    window.addEventListener('popstate', (ev) => this._onRouteChange(ev));
  }

  _onClick(ev) {
    if (ev.ctrlKey || ev.metaKey || ev.which > 1) {
      return;  // ignore event while buttons are pressed
    }

    const link = findClosestLink(ev);
    if (!link) {
      return;
    }
    const sceneName = this._sceneFromUrl(new URL(link.href));
    if (sceneName === null) {
      return;
    }

    const scope = new URL('./', window.location.href);
    const updateUrl = new URL(`${sceneName || 'village'}.html`, scope);
    window.history.pushState(null, null, updateUrl);

    const loader = this.shadowRoot.querySelector('santa-loader');
    loader.load(sceneName || 'village');
    ev.preventDefault();
  }

  _sceneFromUrl(cand) {
    const scope = new URL('./', window.location.href);
    if (scope.origin !== cand.origin) {
      return null;  // different origin
    } else if (!cand.pathname.startsWith(scope.pathname)) {
      return null;  // different dir
    }
    const test = cand.pathname.substr(scope.pathname.length);
    const m = /^(?:|(\w+)\.html)$/.exec(test);
    if (!m) {
      return null;  // something weird
    }
    return m[1] || '';
  }

  closeSidebar() {
    const input = this.shadowRoot.getElementById(`${this._idPrefix}sidebar`);
    if (input) {
      input.checked = false;
    }
  }

  _onMainFocus(ev) {
    this.closeSidebar();
  }

  _onLoaderProgress(ev) {
    this._progress = ev.detail;
  }

  _onLoaderLoad(ev) {
    this.closeSidebar();

    this._progress = null;
    this._sceneName = ev.detail;
    console.debug('scene is', this._sceneName);
  }

  _onLoaderError(ev) {
    this.closeSidebar();

    this._progress = null;
    this._sceneName = null;
  }

  _onRouteChange(ev) {
    const sceneName = this._sceneFromUrl(window.location);
    if (sceneName === null) {
      window.location.href = window.location.href;  // abort, we don't know what this page is
      return;
    }

    // nb. the Polymer 2 incantation showed a full-screen loader for back/forwards, because the URL
    // has actually changed already.
    const loader = this.shadowRoot.querySelector('santa-loader');
    loader.load(sceneName || 'village');
  }

  _onIframeScroll(ev) {
    this._iframeScroll = (ev.detail !== 0);
  }

  render() {
    return html`
<style>${_style`santa-app`}</style>
<div class="preload" ?hidden=${this._progress == null}>
  <div class="bar" style="width: ${(this._progress || 0) * 100}%"></div>
</div>
<div class="sidebar">
  <input type="checkbox" id="${this._idPrefix}sidebar" />
  <santa-sidebar .todayHouse=${this.todayHouse} .trackerIsOpen=${this.trackerIsOpen}>
    <div class="closer">
      <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
      </label>
    </div>
  </santa-sidebar>
  <label class="hider" for="${this._idPrefix}sidebar"></label>
</div>
<main @focusin=${this._onMainFocus} class=${sceneIsScroll(this._sceneName) ? 'scroll' : ''}>
  <header class=${this._iframeScroll ? '' : 'up'}>
    <div class="bg" style="background-color: ${colorForScene(this._sceneName)};"></div>
    <label for="${this._idPrefix}sidebar" class="svg-label" tabindex="0">
<svg><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    </label>
    <a class="linkwrap" href="./">
<div class="logo">Google </div><h1>${_msg`santatracker`}</h1>
    </a>
  </header>
  <div class="noscene" ?hidden=${this._sceneName != null}>
    <santa-weather></santa-weather>
    <div class="icon"></div>
    <p>${_msg`error-not-found`}</p>
  </div>
  <santa-loader @progress=${this._onLoaderProgress} @load=${this._onLoaderLoad} @error=${this._onLoaderError} @iframe-scroll=${this._onIframeScroll}></santa-loader>
</main>
    `;
  }
}


customElements.define('santa-app', SantaAppElement);
