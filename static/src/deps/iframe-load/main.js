
const emptyPageHref = 'data:text/html;base64,';
const defaultFrameTimeout = 4000;


/**
 * @template {T}
 */
export class LoaderHandler {

  /**
   * Delays the removal of a previous frame (and the completion of load).
   *
   * @param {!HTMLIFrameElement} frame
   * @param {?string} href
   */
  async unload(frame, href) {}

  /**
   * Allows the iframe to be configured. Delays load return, and can be preempted. This is called
   * before the frame's load event is first received.
   *
   * It is guaranteed that the frame will generate a load event, even if preempted. This is not
   * normally guaranteed by all browsers (e.g. Safari will never notify you of a network failure).
   *
   * This is passed the href and context specified in `.load()`. To retain or use the context in
   * ready() on this class, return it here.
   *
   * @param {!HTMLIFrameElement} frame
   * @param {?string} href
   * @param {*} context
   * @return {!Promise<T>}
   */
  async prepare(frame, href, context) {}

  /**
   * Called after a frame is ready as part of load. If this returns a Promise, it will delay the
   * return of `.load()`, but the loader will generally be considered complete.
   *
   * @param {!HTMLIFrameElement} frame
   * @param {?string} href
   * @param {T} payload
   */
  async ready(frame, href, payload) {}
}


export class Loader {

  /**
   * @param {!HTMLElement} container
   * @param {!LoaderHandler=} handler
   */
  constructor(container, handler = new LoaderHandler()) {
    this._container = container;
    this._handler = handler;
    this._disabled = false;

    this._activeFrame = this.constructor.createFrame(emptyPageHref);
    this._activeHref = /** @type {?string} */ (null);
    this._previousFrame = /** @type {?HTMLIFrameElement} */ (null);
    this._previousFrameUnload = /** @type {?Promise<*>} */ (null);
    this._preemptHandler = /** @type {function(): void|null} */ (null);

    this._container.appendChild(this._activeFrame);
  }

  /**
   * Returns the default time to wait before checking on an unloaded <iframe>. This won't effect
   * Chrome or Firefox^, which report a load even on network error.
   *
   * ^using a custom Firefox event
   *
   * @return {number} the default time to wait before timeout
   */
  static timeout() {
    return defaultFrameTimeout;
  }

  /**
   * Creates a new frame.
   *
   * @param {?string} href
   * @return {!HTMLIFrameElement}
   */
  static createFrame(href) {
    const iframe = document.createElement('iframe');
    iframe.src = href;
    iframe.setAttribute('sandbox', 'allow-forms allow-same-origin allow-scripts allow-popups allow-top-navigation allow-top-navigation-by-user-activation allow-downloads allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', 'autoplay');  // ... ignored in Safari
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    return iframe;
  }

  /**
   * An unhandled load occured. By default, replace with a blank page, although the load has still
   * completed at this point.
   *
   * @param {!HTMLIFrameElement} frame
   * @param {?string} href
   */
  static unhandledLoad(frame, href) {
    frame.contentWindow.location.replace(emptyPageHref);
  }

  /**
   * Disables the passed frame for user interaction.
   *
   * @param {!HTMLIFrameElement} frame
   */
  static disableFrame(frame) {
    if (document.activeElement === frame) {
      window.focus();
    }
    frame.setAttribute('tabindex', '-1');
    frame.style.pointerEvents = 'none';
  }

  /**
   * Enables the passed frame for user interaction.
   *
   * @param {!HTMLIFrameElement} frame
   */
  static enableFrame(frame) {
    frame.removeAttribute('tabindex');
    frame.style.pointerEvents = '';  // empty string for IE11
  }

  /**
   * @return {boolean} whether the frame is currently being loaded
   */
  get isLoading() {
    // nb. This might be removed from the page, but is non-null until load is complete
    return this._previousFrame !== null;
  }

  /**
   * @return {string} the most recently loaded href (may still be loading)
   */
  get href() {
    return this._activeHref;
  }

  /**
   * @param {boolean} v whether to disable user interaction on the loaded frame
   */
  set disabled(v) {
    this._disabled = v;
    if (v) {
      this.constructor.disableFrame(this._activeFrame);
      this._activeFrame.setAttribute('disabled', '');
    } else if (!this.isLoading) {
      // tabindex should remain -1 during loading.
      this.constructor.enableFrame(this._activeFrame);
      this._activeFrame.removeAttribute('disabled', '');
    }
  }

  /**
   * @return {boolean} whether user interaction is disabled on the loaded frame
   */
  get disabled() {
    return this._disabled;
  }

  /**
   * Load a new frame with the given URL.
   *
   * @param {?string} href
   * @param {*} context
   * @return {!Promise<*|undefined>}
   */
  async load(href, context) {
    if (this._previousFrame) {
      // If there was still a previousFrame set, then the last activeFrame never loaded, so call
      // our preempt handler.
      // The previousFrame might already be removed at this point, but it's still non-null.
      this._preemptHandler();
      this._container.removeChild(this._activeFrame);
    } else {
      // Move the current activeFrame to be our previousFrame.
      this.constructor.disableFrame(this._activeFrame);
      this._activeFrame.removeAttribute('disabled');  // the unloaded frame is never "disabled"
      this._previousFrame = this._activeFrame;
      this._previousFrameUnload = this._handler.unload(this._previousFrame, this._activeHref);

      // Once done, remove the frame. We block until after this Promise anyway.
      this._previousFrameUnload.then(() => this._container.removeChild(this._previousFrame));
    }

    const frame = this.constructor.createFrame(href || emptyPageHref);
    this.constructor.disableFrame(frame);
    if (this._disabled) {
      frame.setAttribute('disabled', '');
    }
    this._container.appendChild(frame);
    this._activeFrame = frame;
    this._activeHref = href;

    const framePrepare = this._handler.prepare(frame, href, context);
    let preparePayload;

    const preempted = await new Promise((resolve, reject) => {
      const localUnload = this._previousFrameUnload;
      let loaded = false;

      // After the specified delay, make an additional GET request to the target. This is needed
      // for browsers which don't give feedback for a failed iframe load (e.g. network failure).
      // Note that this might spew errors to the console about CORS. This is fine but noisy.
      // In practice, this is only needed for Safari.
      const timeout = window.setTimeout(() => {
        const x = new XMLHttpRequest();
        // nb. We used to set withCredentials here, but it usually generated loud CORS errors.

        // Configure XHR handler. Runs on XHR success or load (to cancel an in-flight XHR).
        const handler = () => {
          x.abort();
          x.onreadystatechange = null;
          frame.removeEventListener('load', handler);

          // It's possible that the XHR has arrived back after the frame was a success.
          if (!loaded && frame.parentNode) {
            frame.contentWindow.location.replace(emptyPageHref);  // causes 'load' event
          }
        };
        frame.addEventListener('load', handler);

        let extraTimeout = 0;
        x.onreadystatechange = () => {
          // We expect to see readyState of 4, which means the fetch is 'done' (sucess or failure).
          // Seeing 2 or 3 would be surprising, since it means the load is working, so give the
          // final timeout more time to complete. This could occur for a very large HTML fetch,
          // where both the iframe and the XHR are progressing simultaneously.
          if (x.readyState !== 4) {
            window.clearTimeout(extraTimeout);
            extraTimeout = window.setTimeout(handler, this.constructor.timeout());
          } else {
            handler();
          }
        };
        x.open('GET', href);
        x.send();
      }, this.constructor.timeout());

      // Firefox supports the non-standard DOMFrameContentLoaded, but only on window. This is
      // called even if the iframe _fails_ to load.
      const firefoxLoadHandler = (event) => {
        if (event.target !== frame) {
          return;
        }
        cleanup();  // we're now managing our own cleanup
        window.setTimeout(() => {
          // DOMFrameContentLoaded and load should arrive in quick succession (although in
          // practice they are largely out of sync). If they have not, then send a custom load
          // event (to match Chrome's behavior). Because of this, Firefox is actually aware of
          // iframe load failures (although not used in this library).
          if (!loaded) {
            const ce = new CustomEvent('load');  // only for Firefox, don't need polyfill
            frame.dispatchEvent(ce);
          }
        }, this.constructor.timeout());  // use long timeout like above
      };

      const loadHandler = () => {
        if (!loaded) {
          cleanup();
          loaded = true;

          // Don't resolve the promise early, as this would prevent the preempt check; wait until
          // unload is complete, prepare is done, and then call resolve or reject.
          return Promise.resolve()
              .then(() => localUnload)
              .then(() => framePrepare.then((payload) => {
                // snipe payload on the way through
                preparePayload = payload;
                return payload;
              }))
              .then(() => resolve(false))
              .catch(reject);
        }

        // This is an extra load after the initial one managed by iframe-loader. We don't look at
        // other ways to detect loads, and ignore failed loads by unsupported browsers.
        frame.removeEventListener('load', loadHandler);
        this.constructor.unhandledLoad(frame, href);
      };

      // Resolve promise if preempted, cleaning up after ourselves.
      this._preemptHandler = () => {
        cleanup();
        resolve(true);
      };

      window.addEventListener('DOMFrameContentLoaded', firefoxLoadHandler);
      frame.addEventListener('load', loadHandler);

      // We add some global handlers. Configure a shared cleanup handler. Intentionally hoisted.
      function cleanup() {
        window.removeEventListener('DOMFrameContentLoaded', firefoxLoadHandler);
        window.clearTimeout(timeout);
      }
    });
    if (preempted) {
      return undefined;  // this frame was preempted by another
    }

    if (!this._disabled) {
      this.constructor.enableFrame(frame);
    }
    this._previousFrame = null;
    this._previousFrameUnload = null;
    this._preemptHandler = null;

    return this._handler.ready(frame, href, preparePayload);
  }

  /**
   * @return {boolean} whether the active frame has focus
   */
  get hasFocus() {
    // This is impossible to listen to. It's possible to determine whether focus transitions from
    // the current window to ANY frame, but then focus changes _between_ frames aren't visible, as
    // there's no useful intermediate state.
    return document.activeElement === this._activeFrame;
  }

  /**
   * Attempt focus on the active frame, if it's loaded.
   */
  focus() {
    if (!this._activeFrame.hasAttribute('tabindex')) {
      this._activeFrame.focus();
    }
  }
}
