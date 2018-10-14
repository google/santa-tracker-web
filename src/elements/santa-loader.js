
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


class SantaLoaderElement extends HTMLElement {
  constructor() {
    super();

    this._onFrameScrollNotify = false;

    this._route = null;
  
    this._onMessage = this._onMessage.bind(this);
    this._onMessageHandler = new WeakMap();

    this._activeFrame = document.createElement('iframe');
    this._activeFrame.src = EMPTY_PAGE;
    this._preloadFrame = null;
    this._preloadResolve = null;
  }

  connectedCallback() {
    window.addEventListener('message', this._onMessage);
    this._load(this._route);  // in case route changed while disconnected
  }

  disconnectedCallback() {
    window.removeEventListener('message', this._onMessage);
  }

  _onMessage(ev) {
    const src = this._onMessageHandler.get(ev.source);
    src && src(ev);
  }

  _onFrameScroll() {
    if (this._onFrameScrollNotify) {
      return;
    }
    window.requestAnimationFrame(() => {
      this._onFrameScrollNotify = false;
      let scrollTop = 0;
      if (this._activeFrame.contentDocument) {
        scrollTop = this._activeFrame.contentDocument.scrollingElement.scrollTop;
      }
      this.dispatchEvent(new CustomEvent('iframe-scroll', {detail: scrollTop}));
    });
    this._onFrameScrollNotify = true;
  }

  set route(v) {
    this._route = v;
    this.isConnected && this._load(v);
  }

  get route() {
    return this._route;
  }

  _load(route) {
    if (this._preloadFrame) {
      // nb. this does not call _fail, as it's not really a failure
      this._preloadResolve(new Error('cancelled'));
      this._preloadFrame.remove();
      this._preloadFrame = null;
      this._preloadResolve = null;
    }

    const pf = iframeForRoute(route);
    if (this._activeFrame.src === pf.src) {
      // nothing to do, already loaded; a different preload was pending?
      this.dispatchEvent(new CustomEvent('load', {detail: route}));
      return Promise.resolve();
    }

    // great, kick off the preload: mark iframe hidden, add to DOM
    pf.hidden = true;
    this._preloadFrame = pf;
    this.dispatchEvent(new CustomEvent('progress', {detail: 0}));
    this.appendChild(pf);

    // explicitly disallow URL changes in this frame by failing if we're unloaded
    pf.contentWindow.addEventListener('beforeunload', (ev) => this._fail(pf, 'URL loaded inside frame'));

    // listen to scroll so the top bar can be made visible/hidden
    pf.contentWindow.addEventListener('scroll', (ev) => this._onFrameScroll(), {passive: true});

    // wait a frame for a 'hello' message once load is done, or fail
    pf.addEventListener('load', (ev) => {
      window.setTimeout(() => {
        if (this._preloadFrame === pf) {
          console.info('route', route, 'failed to hello');
          this._fail(pf, 'failed to send hello event');
        }
      }, 0);
    });

    this._onMessageHandler.set(pf.contentWindow, (ev) => {
      if (this._preloadFrame === pf) {
        // TODO(samthor): Could this change for external scenes (with full URL)? They might not
        // be changable to support 'hello'-ing us.
        if (ev.data === 'hello') {
          this._upgradePreload(route);
        }
      } else if (this._activeFrame === pf) {
        console.info('got data from', route, ev.data);
      } else {
        // frame no longer active, ignore
      }
    });

    return new Promise((resolve) => {
      this._preloadResolve = resolve;
    });
  }

  _fail(iframe, reason='failed') {
    if (iframe === this._preloadFrame) {
      // failed to load a new scene
      this._preloadFrame.remove();
      this._preloadResolve(new Error(reason));
      this._preloadFrame = null;
      this._preloadResolve = null;
    }

    this._activeFrame.remove();
    this._activeFrame = document.createElement('iframe');
    this.dispatchEvent(new CustomEvent('error'));
    this._onFrameScroll();
  }

  _upgradePreload(route) {
    this._preloadFrame.hidden = false;
    this._activeFrame.remove();
    this._activeFrame = this._preloadFrame;
    this._preloadResolve();
    this._preloadFrame = null;
    this._preloadResolve = null;

    this.dispatchEvent(new CustomEvent('load', {detail: route}));
    this._onFrameScroll();
  }
}


customElements.define('santa-loader', SantaLoaderElement);
