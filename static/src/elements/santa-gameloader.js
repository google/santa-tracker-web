import styles from './santa-gameloader.css';

import * as messageSource from '../lib/message-source.js';
import {resolvable} from '../lib/promises.js';



class PortControl {
  constructor() {
    this._port = null;
    this._done = false;
    this._attached = false;
    this._closed = false;

    this._nextPromise = null;
    this._nextResolve = null;
    this._q = [];
  }

  attach(port) {
    if (this._attached || this._done) {
      throw new Error('cannot attach twice');
    }
    if (port) {
      this._port = port;
      port.onmessage = (ev) => this.push(ev.data);
    }
    this._attached = true;
  }

  get hasPort() {
    return Boolean(this._port);
  }

  get isAttached() {
    return this._attached;
  }

  send(x) {
    if (this._port) {
      this._port.postMessage(x);
    }
  }

  shutdown() {
    if (this._done) {
      throw new Error('cannot shutdown twice');
    }

    this._done = true;
    this._attached = false;
    this.push(null);  // safe even if this goes to queue

    return () => {
      this._closed = true;
      if (this._port) {
        this._port.close();
      }
      this._port = null;
    };
  }

  get done() {
    return this._done;
  }

  push(arg) {
    if (this._nextResolve) {
      this._nextResolve(arg);
      this._nextResolve = null;
      this._nextPromise = null;
    } else {
      this._q.push(arg);
    }
  }

  next() {
    if (this._closed) {
      return null;
    } else if (this._q.length) {
      return this._q.shift();
    } else if (this._done) {
      return null;
    } else if (!this._nextPromise) {
      this._nextPromise = new Promise((resolve) => {
        this._nextResolve = resolve;
      });
    }
    return this._nextPromise;
  }
}



const EMPTY_PAGE = 'data:text/html;base64,';
const LOAD_LEEWAY = 250;
const SANDBOX = 'allow-forms allow-pointer-lock allow-scripts allow-popups';


export const events = Object.freeze({
  'focus': '-loader-focus',
  'blur': '-loader-blur',
  'load': '-loader-load',
  'prepare': '-loader-prepare',
  'error': '-loader-error',
});
const internalRemove = '-internal-remove';


const createFrame = (src) => {
  const iframe = document.createElement('iframe');
  iframe.src = src || EMPTY_PAGE;
  iframe.setAttribute('sandbox', SANDBOX);
  return iframe;
};


/**
 * Loads iframes.
 */
class SantaGameLoaderElement extends HTMLElement {
  static get observedAttributes() { return ['disabled']; }

  constructor() {
    super();

    const root = this.attachShadow({mode: 'open'});
    root.adoptedStyleSheets = [styles];

    // Use this container to manage focus on contained iframes, rather than setting classes or
    // attributes on the loader itself.
    this._container = document.createElement('main');
    this._container.classList.add('empty');
    root.append(this._container);

    // Wrap `<slot>` in a container that can be toggled in an error state. The naked slot contains
    // content which will be displayed if a game fails to load, such as `<santa-error>`.
    const slotContainer = document.createElement('div');
    slotContainer.classList.add('slot-container');
    const slot = document.createElement('slot');
    slotContainer.append(slot);
    this._container.append(slotContainer);

    this._onWindowBlur = this._onWindowBlur.bind(this);
    this._onWindowFocus = this._onWindowFocus.bind(this);
    this._frameFocus = false;

    this._loading = false;
    this._control = new PortControl();

    this._href = null;
    this._previousFrame = null;
    this._previousFrameClose = null;  // called when _previousFrame is cleared
    this._activeFrame = createFrame();
    this._container.append(this._activeFrame);

    // Create DOM that contains overlay elements.
    // TODO(samthor): This isn't really to do with the gameloader, but serves as a convinent place
    // to place elements which are intended to look like they're part of the game (tutorial,
    // rotate, level up indicators).

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const holder = document.createElement('div');
    holder.classList.add('holder');

    const slotOverlay = document.createElement('slot');
    slotOverlay.setAttribute('name', 'overlay');

    root.append(overlay);
    overlay.append(holder);
    holder.append(slotOverlay);
  }

  get frameFocus() {
    return this._frameFocus;
  }

  _onWindowBlur(e) {
    // Check various types of focus. Since the only focusable thing here is our iframes, be a bit
    // aggressive for the polyfill case.
    if (document.activeElement === this || this.contains(document.activeElement)) {
      if (this._loading) {
        // Prevent focus if we're in a loading state. The <iframe> needs to exist as-normal on the
        // page to correctly load, but users should not be able to focus it.
        throw new Error('iframe got focus during load');

        // TODO(samthor): With `<iframe tabindex=-1>` and `pointer-events: none`, this should never
        // happen. We can programatically reset focus by blur-ing the iframe in a rAF, however.

      } else if (this._frameFocus) {
        // already marked focus, do nothing
      } else {
        this._frameFocus = true;
        this.dispatchEvent(new CustomEvent(events.focus));
      }
    }
  }

  _onWindowFocus(e) {
    if (this._frameFocus) {
      this._frameFocus = false;
      this.dispatchEvent(new CustomEvent(events.blur));
    }
  }

  connectedCallback() {
    window.addEventListener('blur', this._onWindowBlur);
    window.addEventListener('focus', this._onWindowFocus);
  }

  disconnectedCallback() {
    window.removeEventListener('blur', this._onWindowBlur);
    window.removeEventListener('focus', this._onWindowFocus);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'disabled') {
      if (newValue !== null) {
        window.focus();  // move focus from activeFrame
        this._activeFrame.setAttribute('tabindex', -1);
      } else if (!this._loading) {
        this._activeFrame.removeAttribute('tabindex');
      }
    }
  }

  /**
   * Optionally purge any `previousFrame` that is being held during a load. Called by transition
   * code to clear content once we're done with it.
   */
  purge() {
    // nb. does not null out the previousFrame, as we use it to indicate in-progress load
    this._previousFrame && this._previousFrame.remove();
    this._previousFrameClose && this._previousFrameClose();
  }

  /**
   * Load a new scene.
   *
   * @param {?string} href
   * @param {?*} context to pass via .load event
   */
  load(href, context=null) {
    this._href = href || null;

    this._loading = true;
    this._container.classList.add('loading');

    // Inform any open control (for the activeFrame) that it is to be closed, by sending null.
    const close = this._control.shutdown();
    this._control = new PortControl();

    if (this._previousFrame) {
      // If there's still a previousFrame set, then the previous activeFrame never loaded. Clear it
      // and dispatch an internal message: it was never made visible to end-users.
      // TODO: revisit if both frames are visible at the same time for a transition
      this._activeFrame.dispatchEvent(new CustomEvent(internalRemove));
      this._activeFrame.remove();
      close();  // frame has gone immediately, close port now
    } else {
      // Whatever was active is now ultimately going to meet its demise.
      this._previousFrame = this._activeFrame;
      this._previousFrame.setAttribute('tabindex', -1);  // prevent tab during clear
      window.focus();  // move focus from previousFrame

      // Configure a final close helper for when the previousFrame is actually removed.
      this._previousFrameClose = close;
    }

    // Inform listeners that there's a new load occuring. This will likely start the display of a
    // loading interstitial or similar (although can fire multiple times).
    this.dispatchEvent(new CustomEvent(events.load, {detail: {context}}));

    const af = createFrame(this._href);
    this._activeFrame = af;
    this._activeFrame.classList.add('pending');
    this._activeFrame.setAttribute('tabindex', -1);  // prevent tab during load
    this._container.append(af);

    let portPromise = Promise.resolve(null);
    if (href) {
      portPromise = new Promise((resolve, reject) => {

        // Resolves with a MessagePort from the frame.
        // nb. This needs to happen _after_ being added to the DOM, otherwise .contentWindow is null.
        messageSource.add(af.contentWindow, (ev) => {
          if (ev.data !== 'init' || !(ev.ports[0] instanceof MessagePort)) {
            return reject(new Error(`unexpected from preload: ${ev.data}`));
          }
          resolve(ev.ports[0]);
        });

        // Handle being removed due to being replaced with some other frame before being loaded.
        af.addEventListener(internalRemove, () => resolve(null), {once: true});

        // Resolves with null after load + delay, indicating that the scene has failed to init. The
        // loader should normally resolve with its MessagePort.
        af.addEventListener('load', () => {
          window.setTimeout(() => resolve(null), href ? LOAD_LEEWAY : 0);

          // TODO(samthor): If another load event arrives, this is because the internal <iframe>
          // loaded a new URL. We should kill it in this case.
          af.addEventListener('load', (ev) => {
            console.warn('got inner load, should kill frame', af);
          });
        }, {once: true});

      });
    }

    // nb. This method should never fail for external reasons; failures here are an internal issue.
    return this._prepareFrame(portPromise, af, context);
  }

  async _prepareFrame(portPromise, af, context) {
    const port = await portPromise;
    if (af !== this._activeFrame) {
      return false;  // another frame was requested before initial init message
    }
    this._control.attach(port);

    let readyResolve;
    const readyPromise = new Promise((resolve) => {
      readyResolve = resolve;
    });
    const ready = () => {
      if (af !== this._activeFrame) {
        readyResolve(false);
        return false;
      } else if (!this._loading) {
        return true;  // ready was called twice
      }

      // Success: the frame has reported ready. The following code is entirely non-async, and just
      // cleans up state as the scene is now active and happy.

      if (this.disabled) {
        // Retain `tabindex=-1`, which prevents use of the iframe.
      } else {
        this._activeFrame.removeAttribute('tabindex');
      }

      this._loading = false;
      this._activeFrame.classList.remove('pending');
      this._container.classList.remove('loading');

      // If nothing loaded, allow <slot> content and remove itself. This is still "success".
      this._container.classList.toggle('empty', !port);
      if (port === null) {
        this._activeFrame.remove();
      }

      this.purge();
      this._previousFrame = null;
      this._previousFrameClose = null;

      readyResolve(true);
      return true;
    };

    const {promise: scenePromise, resolve: sceneResolve} = resolvable();

    // Ensure that `ready` is always called. And, that if the scene runner has an uncaught error,
    // it is announced.
    scenePromise.then(ready, (error) => {
      if (af === this._activeFrame) {
        const detail = {error, context};
        this.dispatchEvent(new CustomEvent(events.error, {detail}));
      } else {
        console.warn('error from closed scene', af.src, error)
      }
    });

    // Announce to the caller that it can now prepare a new frame, listening to control events and
    // doing work. Control can also be null if the scene failed to load or is the blank page.
    const detail = {
      context,
      control: this._control,
      resolve: sceneResolve,
      ready,  // "call me when done"
      href: this._href,
    };
    this.dispatchEvent(new CustomEvent(events.prepare, {detail}));
    return readyPromise;
  }

  get href() {
    return this._href;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(v) {
    this.toggleAttribute('disabled', v);
  }

  focus() {
    // TODO: should we overload focus?
    if (!this._activeFrame.hasAttribute('tabindex')) {
      this._activeFrame.focus();
    }
  }
}


customElements.define('santa-gameloader', SantaGameLoaderElement);