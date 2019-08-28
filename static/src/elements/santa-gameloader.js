import styles from './santa-gameloader.css';

import './santa-interlude.js';


const EMPTY_PAGE = 'data:text/html;base64,';


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
    af.src = this._href || EMPTY_PAGE;
//    af.setAttribute('scrolling', 'no');  // for iOS
    af.className = 'loading prep';

    this._wrapper.append(af);
    this._activeFrame = af;

    const readyPromise = new Promise((r) => {
      af.addEventListener('load', () => {
        r();
        af.classList.remove('prep');
      }, {once: true});
    });

    const transitionPromise = new Promise((r) => {
      // TODO: longer than fade time, remove old frame when gone
      window.setTimeout(r, 5000);
    });

    Promise.all([readyPromise, transitionPromise]).then(() => {
      if (this._activeFrame === af) {
        af.className = '';
        af.style.left = null;
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