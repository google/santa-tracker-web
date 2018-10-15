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
    iframe.src = `./scenes/${route || 'index'}.html`;
  }

  return iframe;
}


const SCENE_LOAD_START_TIMEOUT_MS = 1000;

class SantaLoaderElement extends LitElement {
  static get properties() {
    return {
      activeSceneName: {type: Object},
      selectedSceneName: {type: Object},
      loadingSceneDetails: {type: Object}
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
    if (this._preloadFrame != null) {
      this._preloadFrame.remove();
      this._preloadFrame = null;
    }

    this._lastProgress = -1;
    const preloadFrame = this._preloadFrame = iframeForRoute(sceneName);
    preloadFrame.hidden = true;
    this.appendChild(preloadFrame);

    preloadFrame._unloadListener = (ev) =>
        this._fail(preloadFrame, 'URL loaded inside frame');
    preloadFrame._scrollListener = (ev) => this._onFrameScroll();


    let timeoutTimer;
    try {
      await new Promise((resolve, reject) => {
        timeoutTimer = setTimeout(
            () => reject('Timed out waiting for preload to start'),
            SCENE_LOAD_START_TIMEOUT_MS);
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

    this.dispatchEvent(
        new CustomEvent('activate', {detail: this.selectedSceneName}));
    this._onFrameScroll();
  }

  _dispose(iframe) {
    iframe.remove();
    if (iframe._unloadListener) {
      iframe.removeEventListener('beforeunload', iframe._unloadListener);
    }
    if (iframe._scrollListener) {
      iframe.removeEventListener('scroll', iframe._scrollListener);
    }
  }

  _fail(iframe, reason = 'failed') {
    console.error('Loader critical failure:', reason);

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
      if (this._activeFrame.contentDocument) {
        scrollTop =
            this._activeFrame.contentDocument.scrollingElement.scrollTop;
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
    if (changedProperties.has('selectedSceneName') &&
        this.selectedSceneName !== this.activeSceneName) {
      this._preloadSelectedScene(this.selectedSceneName);
    }

    if (changedProperties.has('loadingSceneDetails')) {
      const details = this.loadingSceneDetails;

      if (details.name !== this.selectedSceneName) {
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

        // explicitly disallow URL changes in this frame by failing if we're
        // unloaded
        this._preloadFrame.contentWindow.addEventListener(
            'beforeunload', this._preloadFrame._unloadListener);

        // listen to scroll so the top bar can be made visible/hidden
        this._preloadFrame.contentWindow.addEventListener(
            'scroll', this._preloadFrame._scrollListener, {passive: true});

        this._markSceneLoadStarted = null;
      }

      if (this._lastProgress < details.progress) {
        this._lastProgress = details.progress;
        this.dispatchEvent(
            new CustomEvent('progress', {detail: details.progress}));
      }

      if (details.ready && this.activeSceneName !== this.selectedSceneName) {
        this.dispatchEvent(new CustomEvent('load', {detail: details.name}));
        this._upgradePreloadFrame();
      }
    }
  }
}


customElements.define('santa-loader', SantaLoaderElement);
