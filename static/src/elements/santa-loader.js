import * as messageSource from '../lib/message-source.js';

const EMPTY_PAGE = 'data:text/html;base64,';


// This controls the time a URL is allowed to preload. After this point, it is made visible
// regardless of whether it has reported back with an 'init' call.
const SCENE_PRELOAD_TIMEOUT = 10 * 1000;


const shutdownSymbol = Symbol('shutdown');


class GamePort {
  constructor() {
    this._port = null;
    this._queue = [];
    this._pendingNext = [];
    this._sendQueue = [];  // null once port connected

    this.shutdown = shutdownSymbol;
  }

  _ready(messagePort) {
    this._port = messagePort;
    this._sendQueue.forEach(({data, resolve}) => {
      this._port.postMessage(data);
      resolve();
    });
    this._sendQueue = null;

    messagePort.onmessage = (ev) => {
      if (this._pendingNext.length) {
        const resolve = this._pendingNext.shift();
        resolve(ev.data);
      } else {
        this._queue.push(ev.data);
      }
    };
  }

  _shutdown() {
    if (this._port) {
      const data = {type: this.shutdown, payload: null};
      this._port.onmessage({data});
      this._port.onmessage = null;
      this._port = null;
    }
  }

  /**
   * @param {string} type
   * @param {*} payload
   * @return {!Promise<void>}
   */
  async send(type, payload) {
    const data = {type, payload};
    if (this._port !== null) {
      this._port.postMessage(data);
      return;
    }
    return new Promise((resolve) => {
      this._sendQueue.push({data, resolve});
    });
  }

  /**
   * @return {!Promise<{type: string, payload: *}>}
   */
  async next() {
    if (this._queue.length) {
      return this._queue.shift();
    }
    return new Promise((resolve) => {
      this._pendingNext.push(resolve);
    });
  }
}


class SantaLoaderElement extends HTMLElement {
  constructor() {
    super();

    this._targetUrl = null;
    this._loadAttempt = 0;

    this._activePort = new GamePort();
    this._activeFrame = document.createElement('iframe');
    this._activeFrame.src = EMPTY_PAGE;
    this._preloadFrame = null;
    this._preloadResolve = null;
    this._preloadPromise = Promise.resolve(null);

    this._onFrameScrollNotify = false;
  }

  _preloadUrl(url) {
    this._maybeStopPreload('cancelled');

    const pf = document.createElement('iframe');
    pf.setAttribute('scrolling', 'no');  // stops iOS doing stupid things
    pf.src = url || EMPTY_PAGE;
    if (this._activeFrame.src === pf.src) {
      // nothing to do, we're already loaded for some reason
      return this._preloadPromise;
    }

    pf.hidden = true;
    this._preloadFrame = pf;
    this.dispatchEvent(new CustomEvent('progress', {detail: 0}));
    this.appendChild(pf);
  
    // fail on unhandled contentWindow error
    pf.contentWindow.addEventListener('error', (ev) => {
      console.warn('contained frame got error', url, ev);
      let s = ev.message;
      try {
        const u = new URL(ev.filename || url);
        s = `${u.pathname}:${ev.lineno}\n${ev.message}`;
      } catch (e) {
        // do nothing
      }
      this._fail(pf, 'error', s);
    });

    // listen to scroll so the top bar can be made visible/hidden
    pf.contentWindow.addEventListener('scroll', (ev) => this._onFrameScroll(), {passive: true});

    // wait for "hello" message before actual load
    let frameInitReceived = false;
    const cleanupMessageHandler = () => messageSource.remove(pf.contentWindow);
    const messageHandler = (ev) => {
      if (ev.data !== 'init' || !(ev.ports[0] instanceof MessagePort)) {
        throw new Error(`unexpected from preload: ${ev.data}`);
      }
      cleanupMessageHandler();
      frameInitReceived = true;

      // init sends preload/game control port
      const messagePort = ev.ports[0];
      const gamePort = new GamePort();

      // allow caller to send initial data
      const send = (data) => messagePort.postMessage(data);
      this.dispatchEvent(new CustomEvent('prepare', {detail: send}));

      // after ~timeout, just open the URL anyway (slow connection?)
      window.setTimeout(() => {
        if (this._upgradePreload(pf, url, gamePort)) {
          console.debug('started', url, 'due to timeout');
        }
      }, SCENE_PRELOAD_TIMEOUT);

      // listen to preload events from the frame and announce to page
      messagePort.onmessage = (ev) => {
        if (ev.data === null) {
          this._upgradePreload(pf, url, gamePort);  // null indicates done

          // rewire to gamePort, loading is done
          gamePort._ready(messagePort);
        } else {
          this.dispatchEvent(new CustomEvent('progress', {detail: ev.data}));
        }
      };
    };
    pf.addEventListener('load', (ev) => {
      window.setTimeout(() => {
        // if the loader hasn't received a postMessage one tick after load, then fail the frame
        // nb. This works because the frame isn't isolated from us. If this is ever pushed to an
        // actually isolated environment, then waiting becomes tricky.
        cleanupMessageHandler();
        if (!frameInitReceived) {
          this._fail(pf, 'missing');
        }
      }, 0);
    });
    messageSource.add(pf.contentWindow, messageHandler);

    const p = new Promise((resolve) => {
      this._preloadResolve = resolve;
    });
    return this._preloadPromise = p.then(() => url);
  }

  /**
   * @return {!Promise<string>} promise for this preload event
   */
  preload() {
    return this._preloadPromise;
  }

  _fail(iframe, reason, more='') {
    this._maybeStopPreload(reason, iframe);

    // fail clears the _activeFrame, so that players are told the load failed
    this._dispose(this._activeFrame);
    this._activeFrame = document.createElement('iframe');
    this.dispatchEvent(new CustomEvent('error', {detail: reason}));
    this._preloadPromise = Promise.reject(reason);
    this._onFrameScroll();

    ga('send', 'event', 'loader-error', reason, more.toString());
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
   * @param {!HTMLIFrameElement} pf that should be matched to upgrade
   * @param {string} url being loaded, to announce via event
   * @param {!MessagePort} port to game frame
   * @return {boolean} whether the preload was upgraded
   */
  _upgradePreload(pf, url, port) {
    if (this._preloadFrame !== pf) {
      return false;
    }

    this._activePort._shutdown();
    this._dispose(this._activeFrame);

    // explicitly disallow URL changes in this frame by failing if we're unloaded
    pf.contentWindow.addEventListener('beforeunload', (ev) => this._fail(pf, 'load'));

    pf.hidden = false;
    this._activePort = port;
    this._activeFrame = pf;
    this._preloadResolve();
    this._preloadFrame = null;
    this._preloadResolve = null;

    const detail = {url, iframe: pf, port};
    this.dispatchEvent(new CustomEvent('load', {detail}));
    this._onFrameScroll();
    return true;
  }

  _dispose(iframe) {
    if (iframe) {
      iframe.remove();
      messageSource.remove(iframe.contentWindow);
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

  _loadTargetUrl() {
    // nb. This delays by a microtask because otherwise some side-effects in santa-app don't occur.
    const preloadUrl = Promise.resolve().then(() => this._preloadUrl(this._targetUrl));

    // if callers fetch preload now, they'll wait until the next tick
    this._preloadPromise = preloadUrl.then(() => this._preloadPromise);
  }

  set targetUrl(v) {
    if (this._targetUrl !== v) {
      this._targetUrl = v;
      this._loadTargetUrl();
    }
  }

  get targetUrl() {
    return this._targetUrl;
  }

  set loadAttempt(v) {
    const prev = this._loadAttempt;
    this._loadAttempt = v;

    if (prev >= v) {
      return;  // do nothing, same or lower
    }

    this._preloadPromise.catch((err) => {
      // This is a bit racey, but at worst it'll attempt to reload a different failed scene.
      this._loadTargetUrl();
    });
  }

  get loadAttempt() {
    return this._loadAttempt;
  }
}


customElements.define('santa-loader', SantaLoaderElement);
