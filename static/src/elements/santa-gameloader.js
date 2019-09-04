import styles from './santa-gameloader.css';

import * as messageSource from '../lib/message-source.js';

const EMPTY_PAGE = 'data:text/html;base64,';
const LOAD_LEEWAY = 250;
const SANDBOX = 'allow-forms allow-pointer-lock allow-scripts allow-downloads-without-user-activation allow-popups';

export const events = Object.freeze({
  'focus': '-loader-focus',
  'blur': '-loader-blur',
  'ready': '-loader-ready',
  'progress': '-loader-progress',
  'preload': '-loader-preload',
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

  /**
   * Optionally purge any `previousFrame` that is being held during a load. Called by transition
   * code to clear content once we're done with it.
   */
  purge() {
    if (this._previousFrame) {
      this._previousFrame.remove();
      // nb. does not null out the previousFrame, as we use it to indicate in-progress load
    }
  }

  /**
   * Load a new scene.
   *
   * @param {?string} href 
   */
  load(href) {
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

    if (port) {
      // If we have a valid port, wait for its loading dance.
      await new Promise((resolve, reject) => {
        port.onmessage = (ev) => {
          if (af !== this._activeFrame) {
            return reject(invalidFrame);
          }

          // Special-case string preload requests from the API. Expects a MessagePort to be
          // included to mark completion.
          if (typeof ev.data === 'string') {
            const p = new Promise((resolve) => {
              const args = {
                detail: {
                  event: ev.data,
                  resolve,
                },
              };
              this.dispatchEvent(new CustomEvent(events.preload, args));
            });
            const port = ev.ports[0];
            p.catch(() => undefined).then((value) => port.postMessage(value));
            return;
          }

          // Otherwise, just announce progress until done (including null).
          const args = {detail: ev.data};
          this.dispatchEvent(new CustomEvent(events.progress, args));

          if (typeof ev.data === 'number') {
            return;  // scenes send progress until null
          } else if (ev.data !== null) {
            console.warn('non-null from scene', this._href, 'data', ev.data);
          }

          port.onmessage = () => {
            throw new Error('unimplemeted');
          };
          // this.dispatchEvent(new CustomEvent(events.port, {detail: port}));

          // port.onmessage = (ev) => {
          //   if (af !== this._activeFrame) {
          //     port.close();  // TODO: store port and shutdown elsewhere?
          //     return;  // TODO: discard
          //   }
          //   // TODO(samthor): Quick hack to showcase route changes.
          //   if (ev.data.type === 'go') {
          //     santaApp.route = ev.data.payload;
          //   }

          //   // TODO: do something
          //   console.debug('got active message', ev.data);
          // };
          resolve();
        };
      });
      validateFrame();
    }

    // Inform the caller that we're ready, but happy to be modified further. This allows for
    // transitions to finish or for an error state to be displayed.
    await new Promise((resolve) => {
      const ce = new CustomEvent(events.ready, {
        cancelable: true,
        detail: {
          port,
          empty: !port,
          href: this._href,
          resolve,
        },
      });
      this.dispatchEvent(ce);
      if (!ce.defaultPrevented) {
        resolve();
      }
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
    this._container.classList.remove('loading');
    this._container.classList.toggle('empty', !port);

    if (this._previousFrame) {
      this._previousFrame.remove();
      this._previousFrame = null;
    }

    if (port) {
      return 'ok';
    }

    this._activeFrame.remove();
    return null;
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