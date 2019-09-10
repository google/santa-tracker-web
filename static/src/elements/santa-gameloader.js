import styles from './santa-gameloader.css';

import * as messageSource from '../lib/message-source.js';
import {portIterator} from '../lib/generator.js';
import {resolvable} from '../lib/promises.js';

const EMPTY_PAGE = 'data:text/html;base64,';
const LOAD_LEEWAY = 250;
const SANDBOX = 'allow-forms allow-pointer-lock allow-scripts allow-downloads-without-user-activation allow-popups';


const assert = (cond, message = 'assertion failed') => {
  if (!cond) {
    throw new Error(message);
  }
};


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

    // Wrap `<slot>` in a container that can be toggled in an error state.
    const slotContainer = document.createElement('div');
    slotContainer.classList.add('slot-container');
    const slot = document.createElement('slot');
    slotContainer.append(slot);
    this._container.append(slotContainer);

    this._onWindowBlur = this._onWindowBlur.bind(this);
    this._onWindowFocus = this._onWindowFocus.bind(this);
    this._frameFocus = false;

    this._loading = false;
    this._control = null;

    this._href = null;
    this._previousFrame = null;
    this._previousFrameClose = null;  // called when _previousFrame is cleared
    this._activeFrame = createFrame();
    this._container.append(this._activeFrame);
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
    let controlClose = null;
    if (this._control) {
      this._control.push(null);
      controlClose = this._control.close.bind(this);
    }
    this._control = null;

    if (this._previousFrame) {
      // If there's still a previousFrame set, then the previous activeFrame never loaded. Clear it
      // and dispatch an internal message: it was never made visible to end-users.
      // TODO: revisit if both frames are visible at the same time for a transition
      this._activeFrame.dispatchEvent(new CustomEvent(internalRemove));
      this._activeFrame.remove();
      controlClose && controlClose();  // frame gone, close channel immediately
    } else {
      // Whatever was active is now ultimately going to meet its demise.
      this._previousFrame = this._activeFrame;
      this._previousFrame.setAttribute('tabindex', -1);  // prevent tab during clear
      window.focus();  // move focus from previousFrame

      // Configure a final close helper for when the previousFrame is actually removed.
      this._previousFrameClose = controlClose;
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

    assert(this._control === null, '_control should be null at this point');
    if (port) {
      this._control = portIterator(port);
    }

    const {promise: readyPromise, resolve: readyResolve} = resolvable();
    const {promise: scenePromise, resolve: sceneResolve} = resolvable();

    // If the scene runner causes an error while active, announce it. Its regular resolved value
    // isn't interesting to us, so don't watch it.
    scenePromise.catch((error) => {
      if (af === this._activeFrame) {
        const detail = {error, context};
        this.dispatchEvent(new CustomEvent(events.error, {detail}));
      } else {
        console.debug('error from closed scene', af.src, error)
      }
    });

    // These look like separate events to the caller, but failure to 'ready' should also cause the
    // scene broadly to fail.
    readyPromise.catch(sceneResolve);

    // Announce to the caller that it can now prepare a new frame, listening to control events and
    // doing work. Control can also be null if the scene failed to load or is the blank page.
    const detail = {
      context,
      control: this._control ? this._control.iter : null,
      resolve: sceneResolve,
      ready: readyResolve,  // this is advertised as just "call me when done", really a Promise
      href: this._href,
    };
    this.dispatchEvent(new CustomEvent(events.prepare, {detail}));

    // Wait for the scene to indicate that it's ready. Swallow errors here, because they're passed
    // to sceneResolve above.
    await readyPromise.catch(null);
    if (af !== this._activeFrame) {
      return false;  // another frame was requested during preload
    }

    // Success! readyPromise resolved without an error. The following code is non-async, and just
    // restores this element back to a sane operating state, including nuking the previousFrame if
    // it's still around.

    if (this.disabled) {
      // Retain `tabindex=-1`, which prevents use of the iframe.
    } else {
      this._activeFrame.removeAttribute('tabindex');
    }

    this._loading = false;
    this._activeFrame.classList.remove('pending');
    this._container.classList.remove('loading');

    // If the frame didn't load, allow <slot> content and remove itself. This is still "success".
    this._container.classList.toggle('empty', !port);
    if (port === null) {
      this._activeFrame.remove();
    }

    this.purge();
    this._previousFrame = null;
    this._previousFrameClose = null;
    return true;
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
}

customElements.define('santa-gameloader', SantaGameLoaderElement);