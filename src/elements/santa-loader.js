
const EMPTY_PAGE = 'data:text/html;base64,';


function iframeForRoute(route) {
  const iframe = document.createElement('iframe');
  iframe.src = EMPTY_PAGE;

  if (route == null || typeof route !== 'string') {
    return iframe;
  }

  try {
    // this is a real URL; it's not clear these are supported yet
    const url = new URL(route);
    iframe.src = url.toString();
    return iframe;
  } catch (e) {
    // ignore
  }

  // don't actually load "index", or URLs that aren't in the simple \w+ form
  if (route === 'index' || !/^(|\w+)$/.exec(route)) {
    return iframe;  // ignore
  }

  let src = `./scenes/${route || 'index'}/`;
  if (document.documentElement.lang) {
    // TODO(samthor): leaky abstraction of determining URL
    src += `${document.documentElement.lang}.html`;
  }
  iframe.src = src;

  return iframe;
}


// This controls the time a scene is allowed to preload. After this point, it is made visible
// regardless of whether it has reported success.
const SCENE_PRELOAD_TIMEOUT = 10 * 1000;


class SantaLoaderElement extends HTMLElement {
  constructor() {
    super();
    this._onMessage = this._onMessage.bind(this);

    this._loadAttempt = 0;
    this._selectedScene = null;
    this._activeFrame = iframeForRoute(null);
    this._preloadFrame = null;
    this._preloadResolve = null;
    this._preloadPromise = Promise.resolve(null);

    this._onFrameScrollNotify = false;

    this._onMessageHandler = new WeakMap();
  }

  connectedCallback() {
    window.addEventListener('message', this._onMessage);
  }

  disconnectedCallback() {
    window.removeEventListener('message', this._onMessage);
  }

  /**
   * @param {!MessageEvent} ev
   */
  _onMessage(ev) {
    // handle if it's one of ours
    const src = this._onMessageHandler.get(ev.source);
    src && src(ev);
  }

  _preloadScene(route) {
    this._maybeStopPreload('cancelled');

    const pf = iframeForRoute(route);
    if (this._activeFrame.src === pf.src) {
      // nothing to do, we're already loaded for some reason
      return this._preloadPromise;
    }

    pf.hidden = true;
    this._preloadFrame = pf;
    this.dispatchEvent(new CustomEvent('progress', {detail: 0}));
    this.appendChild(pf);
  
    // explicitly disallow URL changes in this frame by failing if we're unloaded
    pf.contentWindow.addEventListener('beforeunload', (ev) => this._fail(pf, 'URL loaded inside frame'));

    // fail on unhandled contentWindow error
    pf.contentWindow.addEventListener('error', (ev) => {
      console.warn('contained frame got error', route, ev);
      this._fail(pf, ev.message);
    });

    // listen to scroll so the top bar can be made visible/hidden
    pf.contentWindow.addEventListener('scroll', (ev) => this._onFrameScroll(), {passive: true});

    // wait for "hello" message before actual load
    let frameInitReceived = false;
    const cleanupMessageHandler = () => this._onMessageHandler.delete(pf.contentWindow);
    const messageHandler = (ev) => {
      if (ev.data !== 'init' || !(ev.ports[0] instanceof MessagePort)) {
        throw new Error(`got unexpected message from preload 'init': ${ev.data}`);
      }
      cleanupMessageHandler();
      frameInitReceived = true;

      // after ~timeout, just open the scene anyway (slow connection?)
      window.setTimeout(() => {
        if (this._upgradePreload(pf, route)) {
          console.debug('started', route, 'due to timeout');
        }
      }, SCENE_PRELOAD_TIMEOUT);

      // listen to preload events from the frame and announce to page
      const preloadPort = ev.ports[0];
      preloadPort.onmessage = (ev) => {
        if (ev.data === null) {
          this._upgradePreload(pf, route);  // null indicates done
        } else {
          this.dispatchEvent(new CustomEvent('progress', {detail: ev.data}));
        }
      };
    };
    pf.addEventListener('load', (ev) => {
      window.setTimeout(() => {
        // if the loader hasn't received a postMessage one tick after load, then fail the frame
        cleanupMessageHandler();
        if (!frameInitReceived) {
          this._fail(pf, `frame failed to send 'init' event`);
        }
      }, 0);
    });
    this._onMessageHandler.set(pf.contentWindow, messageHandler);

    const p = new Promise((resolve) => {
      this._preloadResolve = resolve;
    });
    return this._preloadPromise = p.then(() => route);
  }

  /**
   * @return {!Promise<string>} promise for this preload event
   */
  preload() {
    return this._preloadPromise;
  }

  _fail(iframe, reason='failed') {
    // TODO(samthor): Change to enum reason and message, so that the message displayed be relevant
    // (missing, error, ...).
    this._maybeStopPreload(reason, iframe);

    // fail clears the _activeFrame, so that players are told the load failed
    this._dispose(this._activeFrame);
    this._activeFrame = document.createElement('iframe');
    this.dispatchEvent(new CustomEvent('error', {detail: reason}));
    this._onFrameScroll();
  }

  _maybeStopPreload(reason, preloadFrame=null) {
    if (preloadFrame !== null && this._preloadFrame !== preloadFrame) {
      // do nothing, didn't match
    } else if (this._preloadFrame) {
      // nb. this does not call _fail, as it's not really a failure
      this._dispose(this._preloadFrame);
      this._preloadResolve(Promise.reject(new Error(reason)));
      this._preloadFrame.remove();
      this._preloadFrame = null;
      this._preloadResolve = null;
    }
  }

  /**
   * @param {!HTMLIFrameElement} preloadFrame that should be matched to upgrade
   * @param {string} route being loaded, to announce via event
   * @return {boolean} whether the preload was upgraded
   */
  _upgradePreload(preloadFrame, route) {
    if (this._preloadFrame !== preloadFrame) {
      return false;
    }

    this._dispose(this._activeFrame);

    this._preloadFrame.hidden = false;
    this._activeFrame = this._preloadFrame;
    this._preloadResolve();
    this._preloadFrame = null;
    this._preloadResolve = null;

    this.dispatchEvent(new CustomEvent('load', {detail: route}));
    this._onFrameScroll();
    return true;
  }

  _dispose(iframe) {
    if (iframe) {
      iframe.remove();
      this._onMessageHandler.delete(iframe.contentWindow);
    }
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

  _loadSelectedScene() {
    // nb. This delays by a microtask because otherwise some side-effects in santa-app don't occur.
    const preloadScene = Promise.resolve().then(() => this._preloadScene(this._selectedScene));

    // if callers fetch preload now, they'll wait until the next tick
    this._preloadPromise = preloadScene.then(() => this._preloadPromise);
  }

  set selectedScene(v) {
    if (this._selectedScene !== v) {
      this._selectedScene = v;
      this._loadSelectedScene();
    }
  }

  get selectedScene() {
    return this._selectedScene;
  }

  set loadAttempt(v) {
    const prev = this._loadAttempt;
    this._loadAttempt = v;

    if (prev >= v) {
      return;  // do nothing, same or lower
    }

    this._preloadPromise.catch((err) => {
      // This is a bit racey, but at worst it'll attempt to reload a different failed scene.
      this._loadSelectedScene();
    });
  }

  get loadAttempt() {
    return this._loadAttempt;
  }
}


customElements.define('santa-loader', SantaLoaderElement);
