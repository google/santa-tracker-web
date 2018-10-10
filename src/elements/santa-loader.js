class SantaLoaderElement extends HTMLElement {
  constructor() {
    super();

    this._onFrameScrollNotify = false;

    this._onMessage = this._onMessage.bind(this);
    this._onMessageHandler = new WeakMap();

    this._activeFrame = document.createElement('iframe');
    this._preloadFrame = null;
    this._preloadResolve = null;
  }

  connectedCallback() {
    window.addEventListener('message', this._onMessage);
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
      const scrollTop = this._activeFrame.contentDocument.scrollingElement.scrollTop;
      this.dispatchEvent(new CustomEvent('iframe-scroll', {detail: scrollTop}));
    });
    this._onFrameScrollNotify = true;
  }

  load(sceneName) {
    // TODO: don't reload scene if we're already loaded, just fire 'load'

    this.dispatchEvent(new CustomEvent('progress', {detail: 0}));

    const pf = document.createElement('iframe');
    if (this._preloadFrame) {
      this._preloadResolve(new Error('cancelled'));
      this._preloadFrame.remove();
    }
    this._preloadFrame = pf;

    pf.src = `./scenes/${sceneName}.html`;
    pf.hidden = true;
    this.appendChild(pf);

    // explicitly disallow URL changes in this frame by removing self if we're unloaded
    pf.contentWindow.addEventListener('beforeunload', (ev) => {
      pf.remove();
      this.dispatchEvent(new CustomEvent('error'));
    });
    pf.contentWindow.addEventListener('scroll', (ev) => this._onFrameScroll(), {passive: true});

    pf.addEventListener('load', (ev) => {
      if (this._preloadFrame !== pf) {
        return;  // something changed
      }
      this._upgradePreload(sceneName);
    });

    this._onMessageHandler.set(pf.contentWindow, (ev) => {
      console.info('got data from', sceneName, ev.data);
    });

    return new Promise((resolve) => {
      this._preloadResolve = resolve;
    });
  }

  _upgradePreload(sceneName) {
    this._preloadFrame.hidden = false;
    this._activeFrame.remove();
    this._activeFrame = this._preloadFrame;
    this._preloadResolve();
    this._preloadFrame = null;
    this._preloadResolve = null;

    this.dispatchEvent(new CustomEvent('load', {detail: sceneName}));
    this._onFrameScroll();
  }
}


customElements.define('santa-loader', SantaLoaderElement);
