import {html, LitElement} from 'lit-element';
import {until} from 'lit-html/directives/until.js';
import {_static} from '../magic.js';
import * as prefix from '../lib/prefix.js';

import styles from './santa-tutorial.css';


const tutorialTimeout = 1500;


/**
 * @param {string} name asset to load
 * @param {function(boolean): void} callback when asset loads, true for success
 * @return {!Image|!HTMLVideoElement}
 */
function prepareTutorialAsset(name, callback) {
  const src = _static`img/tutorial/` + name;
  let node;

  if (name.endsWith('.mp4')) {
    node = document.createElement('video');
    node.loop = true;
    node.autoplay = true;
    node.muted = true;
    node.addEventListener('canplaythrough', () => callback(true));
  } else {
    node = document.createElement('img');
    node.addEventListener('load', () => {
      const steps = Math.round(node.naturalWidth / 275);
      node.classList.add('steps-' + steps);
      callback(true);
    });
  }

  node.addEventListener('error', () => callback(false));
  node.classList.add('size');
  node.src = src;
  return node;
}


function resetTutorialAsset(node) {
  node.style.animation = '';
  node.src = node.src;
  node.offsetLeft;
  node.style.animation = null;
}


export class SantaTutorialElement extends LitElement {
  static get properties() {
    return {
      filter: {type: String},
      orientation: {type: String},

      _activeNode: {type: Element},
      _displayPromise: {type: Promise},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this._active = null;
    this._dismissed = new Set();
    this._tutorials = new Set();

    // Confusingly, true implies that the element should be hidden.
    this._displayPromise = Promise.resolve(true);
    this.filter = 'mouse';

    this._idPrefix = prefix.id();
  }

  render() {
    return html`
<div ?hidden=${until(this._displayPromise, true)}>
  <button class="size" @click="${this.onClickDismiss_}"></button>
  <svg class="size">
    <clipPath id="${this._idPrefix}path">
      <path d="M104.11 267.68a48.498 48.498 0 0 0 18.043-6.672c13.346 7.81 29.368 11.236 45.834 8.648 28.087-4.415 49.575-25.087 56.396-50.92.167-.024.334-.046.5-.072 27.23-4.28 46.067-28.332 42.076-53.72-1.306-8.3-4.89-15.715-10.074-21.788 12.48-6.234 20.066-20.018 17.784-34.53-2.55-16.23-16.564-27.807-32.495-27.786a62.15 62.15 0 0 0-.747-8.888c-5.07-32.25-34.326-54.684-66.382-51.735C169.346 6.544 154.876-2 139.59.404c-9.673 1.52-17.688 7.116-22.585 14.758-9.554-3.424-20.078-4.572-30.81-2.885-31.022 4.877-53.12 31.746-52.914 62.225a34.77 34.77 0 0 0-4.258.39C10.358 77.83-2.394 95.337.542 114c1.945 12.378 10.304 22.15 21.156 26.475-15.046 8.453-24.013 25.63-21.175 43.678 3.58 22.78 24.63 38.47 47.353 35.572.01 2.452.204 4.935.597 7.433 4.173 26.554 29.084 44.697 55.637 40.523z"/>
    </clipPath>
    <g class="size" clip-path="url(#${this._idPrefix}path)">
      <rect class="size" fill="#fff"></rect>
      <foreignObject class="size">${this._activeNode}</foreignObject>
    </g>
  </svg>
</div>
    `;
  }

  onClickDismiss_(ev) {
    this._active && this.dismiss(this._active);
    ev.target.blur();
  }

  reset() {
    this._activeNode = null;
    this._displayPromise = Promise.resolve(true);
    this._active = null;
    this._tutorials = new Set();
    this._dismissed = new Set();
  }

  _refreshTutorials() {
    if (this._dismissed.has(this._active)) {
      // ok
    } else if (this._active) {
      return;  // nothing to do
    }

    let found = null;

    try {
      // use forEach and throw because IE11 doesn't have iteration.
      this._tutorials.forEach((cand) => {
        if (!this._dismissed.has(cand)) {
          found = cand;
          throw null;
        }
      });
    } catch (e) {
      if (e !== null) {
        throw e;
      }
    }

    if (found) {
      let node;
      const p = new Promise((r) => {
        node = prepareTutorialAsset(found, (ok) => r(!ok));
        this._activeNode = node;
      });

      // If the load failed, then dismiss the tutorial.
      p.then((hidden) => {
        if (hidden && node == this._activeNode) {
          console.debug('santa-tutorial dismissing', found);
          this.dismiss(found);
        }
      });

      const timeout = new Promise((r) => window.setTimeout(r, tutorialTimeout));
      this._displayPromise = Promise.all([p, timeout]).then(([result]) => {
        resetTutorialAsset(node);  // reset to start of playtime
        return result;
      });
    } else {
      this._displayPromise = Promise.resolve(true);
      this._activeNode = null;
    }

    this._active = found;
  }

  dismiss(...tutorials) {
    const size = this._dismissed.size;

    tutorials.forEach((tutorial) => {
      this._dismissed.add(tutorial);
    });

    if (size !== this._dismissed.size) {
      this._refreshTutorials();
    }
  }

  queue(...tutorials) {
    const size = this._tutorials.size;

    tutorials.forEach((tutorial) => {
      this._tutorials.add(tutorial);
    });

    if (size !== this._tutorials.size) {
      this._refreshTutorials();
    }
  }
}

customElements.define('santa-tutorial', SantaTutorialElement);
