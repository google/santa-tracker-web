import {LitElement, html} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

import {_msg, runtimeTranslate, getLanguage, localizeUrl} from '../lib/runtime.js';
import {findClosestLink} from '../lib/dom.js';


function sceneIsScroll(sceneName) {
  return sceneName === 'village';
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
    };
  }

  constructor() {
    super();

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
    const input = this.shadowRoot.getElementById('sidebar');
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
<style>
:host {
  display: block;
}
main {
  min-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-flow: column;
}
input#sidebar {
  visibility: hidden;
}
santa-sidebar {
  z-index: 9;
  position: absolute;
  top: 0;
  height: 100%;
  visibility: hidden;
  outline: 2px solid rgba(0, 0, 0, 0.125);
  min-width: 320px;
  transform: translate(-100%);
  transition: transform 0.25s ease-out;
  animation: santa-app__hide-nav 0.25s step-end forwards;
  pointer-events: none;
  will-change: transform;
}
.hider {
  pointer-events: none;
  z-index: 8;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,198,237,0.6);
  transition: opacity 0.25s ease-in-out;
  will-change: opacity;
  opacity: 0;
}

@keyframes santa-app__hide-nav {
  from { visibility: visible; pointer-events: none; }
    to { visibility: hidden; pointer-events: none; }
}

.sidebar input:checked#sidebar ~ santa-sidebar {
  visibility: visible;
  pointer-events: auto;
  animation: none;
  transform: translate(0);
}
.sidebar input:checked#sidebar ~ .hider {
  pointer-events: auto;
  opacity: 1;
}

.preload {
  display: block;
  z-index: 10;
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.125);
  opacity: 0;
  transition: opacity 0.5s;
  will-change: opacity;
}
.preload:not([hidden]) {
  transition-duration: 0s;
  opacity: 1;
}
.bar {
  height: 100%;
  padding-left: 10%;
  box-sizing: border-box;
  color: #db513c;
  background: currentColor;
  box-shadow: 0 0 2px currentColor;
}
santa-loader {
  flex-grow: 1;
  position: relative;
}
santa-loader iframe {
  border: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}
.closer {
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}
main header {
  z-index: 7;
  height: 38px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  color: white;
  position: relative;
}
main header .bg {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #30cbec;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  will-change: opacity;
  transition: opacity 0.4s ease-in-out;
}
main.scroll header.up .bg {
  opacity: 0;
}
main.scroll header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
main header .linkwrap {
  text-decoration: none;
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
main header .linkwrap .logo {
  width: 62px;
  min-width: 62px;
  background: url(https://maps.gstatic.com/mapfiles/santatracker/v201712241017/elements/santa-chrome/img/google_logo.svg) 0 11px no-repeat;
  background-size: contain;
  margin: 0 4px;
  color: transparent;
  font-size: 0;
  line-height: 38px;
}
main header h1 {
  margin: 0;
  font-family: 'Lobster', Sans-Serif;
  font-size: 19px;
  line-height: 38px;
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.svg-label {
  cursor: pointer;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  position: relative;
  z-index: 0;
}
.svg-label:active::before {
  opacity: 0.1;
}
.svg-label::before {
  content: '';
  background: black;
  opacity: 0;
  will-change: opacity;
  transition: opacity 0.125s;
  border-radius: 10000px;
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  z-index: -100;
}
.svg-label svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}
.noscene {
  background: url(https://maps.gstatic.com/mapfiles/santatracker/v201712241017/elements/lazy-pages/img/error.svg) bottom center no-repeat;
  background-size: cover;
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
}
.noscene[hidden] {
  display: none;
}
.noscene .icon {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 10000px;
  box-shadow: 4px 14px 0 rgba(0,0,0,.125);
  background: #7ec6e5 url(img/snowman.png) center no-repeat;
  background-size: 179px 214px;
  overflow: hidden;
}
.noscene p {
  margin: 2em auto;
  max-width: 90%;
  color: #fff;
  font-size: 16px;
  line-height: 28px;
  text-align: center;
}
.noscene:not([hidden]) ~ santa-loader {
  display: none;
}
</style>
<div class="preload" ?hidden=${this._progress == null}>
  <div class="bar" style="width: ${(this._progress || 0) * 100}%"></div>
</div>
<div class="sidebar">
  <input type="checkbox" id="sidebar" />
  <santa-sidebar .todayHouse=${this.todayHouse} .trackerIsOpen=${this.trackerIsOpen}>
    <div class="closer">
      <label for="sidebar" class="svg-label" tabindex="0">
<svg><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
      </label>
    </div>
  </santa-sidebar>
  <label class="hider" for="sidebar"></label>
</div>
<main @focusin=${this._onMainFocus} class=${sceneIsScroll(this._sceneName) ? 'scroll' : ''}>
  <header class=${this._iframeScroll ? '' : 'up'}>
    <div class="bg" style="background-color: ${colorForScene(this._sceneName)};"></div>
    <label for="sidebar" class="svg-label" tabindex="0">
<svg><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
    </label>
    <a class="linkwrap" href="./">
<div class="logo">Google </div><h1>${_msg`santatracker`}</h1>
    </a>
  </header>
  <div class="noscene" ?hidden=${this._sceneName != null}>
    <div class="icon"></div>
    <p>${_msg`error-not-found`}</p>
  </div>
  <santa-loader @progress=${this._onLoaderProgress} @load=${this._onLoaderLoad} @error=${this._onLoaderError} @iframe-scroll=${this._onIframeScroll}></santa-loader>
</main>
    `;
  }
}


customElements.define('santa-app', SantaAppElement);
