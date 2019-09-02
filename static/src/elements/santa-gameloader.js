import styles from './santa-gameloader.css';

import './santa-interlude.js';
import * as messageSource from '../lib/message-source.js';

const LOAD_LEEWAY = 1000;
const EMPTY_PAGE = 'data:text/html;base64,';
const SANDBOX = 'allow-forms allow-pointer-lock allow-scripts allow-downloads-without-user-activation allow-popups';


/**
 * Loads iframes. Uses a transition animation and interlude.
 */
class SantaGameLoaderElement extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({mode: 'open'});
    root.adoptedStyleSheets = [styles];
    this._wrapper = Object.assign(document.createElement('div'), {
      id: 'wrap',
    });
    root.append(this._wrapper);

    this._interlude = document.createElement('santa-interlude');
    root.append(this._interlude);

    this._previousFrame = null;

    this._activeFrame = document.createElement('iframe');
    this._activeFrame.src = EMPTY_PAGE;
    this._activeReady = false;

    this._wrapper.append(this._activeFrame);
  }

  _updateActiveFrame() {
    if (this._previousFrame) {
      // previous animation had not finished, abandon
      this._previousFrame.remove();
      this._activeFrame.className = '';  // this will be 'loading'
    }

    this._previousFrame = this._activeFrame;
    const previous = this._previousFrame;
    const clearPrevious = () => {
      if (previous === this._previousFrame) {
        previous.remove();
        this._previousFrame = null;
      }
    };

    // nb. IMMEDIATELY start a fadeout/gone anim
    this._previousFrame.className = 'fade';
    this._previousFrame.addEventListener('transitionend', clearPrevious);
    this._interlude.setAttribute('active', '');

    const af = document.createElement('iframe');
    af.width = window.innerWidth;
    af.height = window.innerHeight;
    af.setAttribute('sandbox', SANDBOX);
    af.src = this._href || EMPTY_PAGE;
//    af.setAttribute('scrolling', 'no');  // for iOS
    af.className = 'loading prep';

    this._wrapper.append(af);
    this._activeFrame = af;

    // Resolves with the iframe's provided MessagePort (or null, where the page failed to init).
    const loadPromise = new Promise((resolve, reject) => {

      // Resolves with a MessagePort from the frame.
      // nb. This needs to happen _after_ being added to the DOM, otherwise .contentWindow is null.
      messageSource.add(af.contentWindow, (ev) => {
        if (ev.data !== 'init' || !(ev.ports[0] instanceof MessagePort)) {
          return reject(new Error(`unexpected from preload: ${ev.data}`));
        }
        resolve(ev.ports[0]);
      });

      // Resolves with null when the frame loads, indicating that the scene has failed to init.
      af.addEventListener('load', () => {
        window.setTimeout(() => resolve(null), LOAD_LEEWAY);

        af.addEventListener('load', (ev) => {
          console.warn('got inner load, should kill frame')
        });

      }, {once: true});

    });

    const transitionPromise = new Promise((r) => {
      // TODO: longer than fade time, remove old frame when gone
      window.setTimeout(r, 5000);
    });

    Promise.all([loadPromise, transitionPromise]).then(([port]) => {
      // TODO: do something with port.
      if (port === null) {
        throw new Error('frame did not init');
      }
      console.info('got game port', port);
      port.onmessage = (ev) => {
        console.info('got message', ev.data);
      };

      if (this._activeFrame === af) {
        af.className = '';
        af.removeAttribute('width');
        af.removeAttribute('height');
        clearPrevious();
        this._interlude.removeAttribute('active');
      }
    });
  }

  set href(v) {
    if (this._href !== v) {
      this._href = v;
      this._updateActiveFrame();
    }
  }

  get href() {
    return this._href;
  }
}

customElements.define('santa-gameloader', SantaGameLoaderElement);