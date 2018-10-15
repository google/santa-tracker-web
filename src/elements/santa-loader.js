import {LitElement} from '@polymer/lit-element';

const EMPTY_PAGE = 'data:text/html;base64,';


function iframeForRoute(route) {
  const iframe = document.createElement('iframe');
  iframe.src = EMPTY_PAGE;

  if (route == null || typeof route !== 'string') {
    return iframe;
  }

  try {
    const url = new URL(route);
    iframe.src = url.toString();
    return iframe;
  } catch (e) {
    // ignore
  }

  // don't actually load "index", or URLs that aren't in the simple \w+ form
  if (route !== 'index' && /^(|\w+)$/.exec(route)) {
    iframe.src = `./scenes/${route || 'index'}/`;
  }

  return iframe;
}


const SCENE_LOAD_START_TIMEOUT_MS = 1000;
const $unloadListener = Symbol('unloadListener');
const $scrollListener = Symbol('scrollListener');

class SantaLoaderElement extends LitElement {
  static get properties() {
    return {
      activeScene: {type: String},
      selectedScene: {type: String},
      loadingSceneDetails: {type: Object},
    };
  }

  constructor() {
    super();

    this._onFrameScrollNotify = false;
    this._activeFrame = null;
    this._preloadFrame = null;

    this._lastProgress = -1;
    this._markSceneLoadStarted = null;
    this._markSceneLoadFailed = null;
  }

  async _preloadSelectedScene(sceneName) {
    if (this._preloadFrame !== null) {
      this._preloadFrame.remove();
      this._preloadFrame = null;
    }

    this._lastProgress = -1;
    const preloadFrame = this._preloadFrame = iframeForRoute(sceneName);
    preloadFrame.hidden = true;
    this.appendChild(preloadFrame);

    preloadFrame[$unloadListener] = (ev) => this._fail(preloadFrame, 'URL loaded inside frame');
    preloadFrame[$scrollListener] = (ev) => this._onFrameScroll();

    // explicitly disallow URL changes in this frame by failing if we're
    // unloaded
    this._preloadFrame.contentWindow.addEventListener(
        'beforeunload', this._preloadFrame[$unloadListener]);

    // listen to scroll so the top bar can be made visible/hidden
    this._preloadFrame.contentWindow.addEventListener(
        'scroll', this._preloadFrame[$scrollListener], {passive: true});

    let timeoutTimer;
    try {
      await new Promise((resolve, reject) => {
        timeoutTimer = window.setTimeout(
            () => reject('Timed out waiting for preload to start'), SCENE_LOAD_START_TIMEOUT_MS);
        this._markSceneLoadStarted = resolve;
        this._markSceneLoadFailed = reject;
      });
    } catch (error) {
      return this._fail(preloadFrame, error);
    }

    this.dispatchEvent(new CustomEvent('preload', {detail: sceneName}));

    clearTimeout(timeoutTimer);
  }

  _upgradePreloadFrame() {
    if (this._preloadFrame == null) {
      return;
    }

    if (this._activeFrame != null) {
      this._dispose(this._activeFrame);
    }

    this._activeFrame = this._preloadFrame;
    this._activeFrame.hidden = false;
    this._preloadFrame = null;

    this.dispatchEvent(new CustomEvent('activate', {detail: this.selectedScene}));
    this._onFrameScroll();
  }

  _dispose(iframe) {
    iframe.remove();
    iframe.removeEventListener('beforeunload', iframe[$unloadListener]);
    iframe.removeEventListener('scroll', iframe[$scrollListener]);
  }

  _fail(iframe, reason = 'failed') {
    console.error('Loader critical failure:', iframe.src, reason);

    this._dispose(iframe);
    this.dispatchEvent(new CustomEvent('error', {detail: reason}));
    this._onFrameScroll();
  }

  _onFrameScroll() {
    if (this._onFrameScrollNotify) {
      return;
    }
    window.requestAnimationFrame(() => {
      this._onFrameScrollNotify = false;
      let scrollTop = 0;
      if (this._activeFrame && this._activeFrame.contentDocument) {
        scrollTop = this._activeFrame.contentDocument.scrollingElement.scrollTop;
      }
      this.dispatchEvent(new CustomEvent('iframe-scroll', {detail: scrollTop}));
    });
    this._onFrameScrollNotify = true;
  }

  createRenderRoot() {
    return this;
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('selectedScene') && this.selectedScene !== this.activeScene) {
      this._preloadSelectedScene(this.selectedScene);
    }

    if (changedProperties.has('loadingSceneDetails')) {
      const details = this.loadingSceneDetails;

      if (details.name !== this.selectedScene) {
        return;
      }

      if (details.error != null) {
        if (this._markSceneLoadFailed) {
          this._markSceneLoadFailed(details.error);
        }
        return;
      }

      if (this._markSceneLoadStarted) {
        this._markSceneLoadStarted();
        this._markSceneLoadStarted = null;
      }

      if (this._lastProgress < details.progress) {
        this._lastProgress = details.progress;
        this.dispatchEvent(new CustomEvent('progress', {detail: details.progress}));
      }

      if (details.ready && this.activeScene !== this.selectedScene) {
        this.dispatchEvent(new CustomEvent('load', {detail: details.name}));
        this._upgradePreloadFrame();
      }
    }
  }
}


customElements.define('santa-loader', SantaLoaderElement);
