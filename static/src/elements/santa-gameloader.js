import styles from './santa-gameloader.css';

import * as messageSource from '../lib/message-source.js';

const EMPTY_PAGE = 'data:text/html;base64,';
const LOAD_LEEWAY = 1000;
const SANDBOX = 'allow-forms allow-pointer-lock allow-scripts allow-downloads-without-user-activation allow-popups';

export const events = Object.freeze({
  'focus': '-loader-focus',
  'blur': '-loader-blur',
  'progress': '-loader-progress',
});
const internalRemove = '-internal-remove';
const invalidFrame = '-invalid-frame-error';


const createFrame = (src) => {
  const iframe = document.createElement('iframe');
  iframe.src = src || EMPTY_PAGE;
  iframe.setAttribute('sandbox', SANDBOX);
  return iframe;
};


/**
 * Loads iframes. Uses a transition animation and interlude.
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
    this._loadingPromise = Promise.resolve(null);

    this._href = '';
    this._previousFrame = null;
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

  load(href, reload=false) {
    if (!reload && this._href === href) {
      return this._loadingPromise;
    }
    this._href = href;

    this._loading = true;
    this._container.classList.add('loading');

    if (this._previousFrame) {
      // If there's still a previousFrame set, then the previous activeFrame never loaded. Clear it
      // and dispatch an internal message: it was never made visible to end-users.
      // TODO: revisit if both frames are visible at the same time for a transition
      this._activeFrame.dispatchEvent(new CustomEvent(internalRemove));
      this._activeFrame.remove();
    } else {
      this._previousFrame = this._activeFrame;
      this._previousFrame.setAttribute('tabindex', -1);  // prevent tab during clear
      window.focus();  // move focus from previousFrame
    }

    const af = createFrame(href);
    this._activeFrame = af;
    this._activeFrame.classList.add('pending');
    this._activeFrame.setAttribute('tabindex', -1);  // prevent tab during load
    this._container.append(af);

    const p = new Promise((resolve, reject) => {

      // Resolves with a MessagePort from the frame.
      // nb. This needs to happen _after_ being added to the DOM, otherwise .contentWindow is null.
      messageSource.add(af.contentWindow, (ev) => {
        if (ev.data !== 'init' || !(ev.ports[0] instanceof MessagePort)) {
          return reject(new Error(`unexpected from preload: ${ev.data}`));
        }
        resolve(ev.ports[0]);
      });

      // Handle being removed due to being replaced with some other frame.
      af.addEventListener(internalRemove, () => resolve(null), {once: true});

      // Resolves with null after load + delay, indicating that the scene has failed to init. The
      // loader should normally resolve with its MessagePort.
      af.addEventListener('load', () => {
        window.setTimeout(() => resolve(null), LOAD_LEEWAY);

        // TODO(samthor): If another load event arrives, this is because the internal <iframe>
        // loaded a new URL. We should kill it in this case.
        af.addEventListener('load', (ev) => {
          console.warn('got inner load, should kill frame', af);
        });
      }, {once: true});

    });

    return this._loadingPromise = this._prepareFrame(p, af).catch((err) => {
      if (err !== invalidFrame) {
        throw err;
      }
      return null;
    });
  }

  async _prepareFrame(p, af) {
    const validateFrame = () => {
      if (af !== this._activeFrame) {
        throw invalidFrame;
      }
    };

    const port = await p;
    validateFrame();

    if (port === null) {
      // TODO: remerge with below behavior?
      this._container.classList.add('empty');
      this._container.classList.remove('loading');
      this._loading = false;
      this._activeFrame.src = EMPTY_PAGE;

      if (this._previousFrame) {
        this._previousFrame.remove();
        this._previousFrame = null;
      }

      return null;
    }

    await new Promise((resolve, reject) => {
      port.onmessage = (ev) => {
        if (af !== this._activeFrame) {
          return reject(invalidFrame);
        }

        const args = {detail: ev.data};
        this.dispatchEvent(new CustomEvent(events.progress, args));

        if (typeof ev.data === 'number') {
          return;  // scenes send progress until null
        } else if (ev.data !== null) {
          console.warn('non-null from scene', href, 'data', ev.data);
        }

        port.onmessage = (ev) => {
          // TODO: do something
          console.debug('got active message', ev.data);
        };
        resolve();
      };
    });

    // Give the game a rAF frame to come up-to-speed.
    // TODO(samthor): Give it a few, to start animations and somesuch.
    await new Promise((r) => window.requestAnimationFrame(r));
    validateFrame();

    if (this.disabled) {
      // Retain `tabindex=-1`, which prevents use of the iframe.
    } else {
      this._activeFrame.removeAttribute('tabindex');
    }

    this._loading = false;
    this._activeFrame.classList.remove('pending');
    this._container.classList.remove('empty', 'loading');

    if (this._previousFrame) {
      this._previousFrame.remove();
      this._previousFrame = null;
    }

    return 'ok';
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