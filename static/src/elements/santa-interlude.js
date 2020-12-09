/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import styles from './santa-interlude.css';
import {_static} from '../../src/magic.js';
import {loadAnimation, buildSafeResize} from '../../src/deps/lottie.js';
import '../../src/polyfill/attribute.js';

const layerCount = 4;

/**
 * Displays a random interlude.
 */
class SantaInterludeElement extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot.adoptedStyleSheets = [styles];

    this._animatePromise = null;
    this._animateResolve = null;
    this._anyVisible = false;

    this._hostElement = Object.assign(document.createElement('div'), {id: 'host'});
    for (let i = 0; i < layerCount; ++i) {
      const layer = Object.assign(document.createElement('div'), {className: 'layer layer-' + i});
      this._hostElement.append(layer);
    }
    const lastLayer = this._hostElement.lastElementChild;
    lastLayer.classList.add('load');

    this._loadingElement = Object.assign(document.createElement('div'), {className: 'progress'});
    lastLayer.append(this._loadingElement);

    this._playingTransitionSound = false;
    this._hostElement.addEventListener('transitionstart', (ev) => {
      if (!this.active) {
        if (!this._playingTransitionSound) {
          this._playingTransitionSound = true;
          this.dispatchEvent(new CustomEvent('transition_out'));
        }
        
        if (ev.target === this._hostElement.firstElementChild) {
          this._playingTransitionSound = false;
        }
      }
    });
    this._hostElement.addEventListener('transitionend', (ev) => {
      if (this.active) {
        if (ev.target === lastLayer) {
          this._animateResolve(true);
        }
      } else if (ev.target === this._hostElement.firstElementChild) {
        this._onGone();
      }
    });

    this._interludeAnimation = loadAnimation(_static`img/interlude/loader.json`, {
      autoplay: true,
      loop: true,
      container: lastLayer,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });
    this._interludeAnimation.addEventListener('DOMLoaded', () => {
      // Fade in the lastLayer when the animation is ready.
      window.requestAnimationFrame(() => lastLayer.classList.remove('load'));
    });

    this.shadowRoot.append(this._hostElement);

    this._onWindowResize = buildSafeResize(this._interludeAnimation);
  }

  connectedCallback() {
    this._updateAnimation();

    Promise.resolve().then(() => {
      // As the animation was triggered before a rAF, it'll be complete immediately. Resolve now.
      if (this.isConnected && this.active) {
        this._animateResolve(true);
      }
    });
  }

  _onStart() {
    this._anyVisible = true;
    this._interludeAnimation.play();
    this.dispatchEvent(new CustomEvent('transition_in'));

    window.addEventListener('resize', this._onWindowResize);
    this._onWindowResize();
  }

  _onStable() {
    // Since the animation has completed, invert the direction so it continues out the other way.
    this._hostElement.classList.add('direction');
  }

  _onGone() {
    window.removeEventListener('resize', this._onWindowResize);
    this._anyVisible = false;
    this._interludeAnimation.stop();

    // Reset the direction for next animation.
    this._hostElement.remove();
    this._hostElement.classList.remove('direction');
    this.shadowRoot.append(this._hostElement);

    // Announce that we're gone (useful for first-time cleanups).
    this.dispatchEvent(new CustomEvent('gone'));
  }

  /**
   * Causes this interlude to take over the whole screen, returning a Promise when complete or
   * cancelled.
   *
   * @return {!Promise<boolean>} true if complete, false if cancelled eearly
   */
  show() {
    this.setAttribute('active', '');
    return this._animatePromise;
  }

  /**
   * Hides this interlude.
   */
  hide() {
    this.removeAttribute('active');
  }

  set active(v) {
    this.toggleAttribute('active', v);
  }

  get active() {
    return this.hasAttribute('active');
  }

  set progress(v) {
    this._progress = v;
  }

  get progress() {
    return this._progress;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    this._updateAnimation();
  }

  _updateAnimation() {
    const active = this.active;
    const wasActive = Boolean(this._animatePromise);
    if (active === wasActive) {
      return;
    }

    if (active) {
      // now active
      this._animatePromise = new Promise((resolve) => {
        this._animateResolve = resolve;
      });
      this._animatePromise.then((success) => {
        if (success) {
          this._onStable();
        }
      });

      this._onStart();
      return;
    }

    if (this._animateResolve) {
      this._animateResolve(false);  // if not already resolved, animation wasn't complete
      this._animateResolve = null;
      this._animatePromise = null;
    }
  }
}

customElements.define('santa-interlude', SantaInterludeElement);