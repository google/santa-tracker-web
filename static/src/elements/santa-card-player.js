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

import {loadAnimation, buildSafeResize} from '../deps/lottie.js';
import '../polyfill/attribute.js';
import {_static} from '../magic.js';

const assetRoot = _static`img/card/`;


const resizePolyfill = class {
  constructor(callback) {
    this._entries = new Set();

    window.addEventListener('resize', () => {
      const all = Array.from(this._entries).map((target) => {
        return {target};
      });
      callback(all);
    });
  }

  observe(target) {
    this._entries.add(target);
  }

  unobserve(target) {
    this._entries.delete(target);
  }
}


const globalResizeObserver = new (window.ResizeObserver || resizePolyfill)((entries) => {
  entries.forEach(({target}) => target.resize());
});

const emptyAnim = {
  getDuration() {
    return 0;
  },
  goToAndStop() {},
  destroy() {},
};

/**
 * Animation curve for intro animation.
 *
 * @param {number} n from 0-1
 * @return {number} from 0-1
 */
function outExpo(n) {
  return 1.0 === n ? n : 1.0 - Math.pow(2, -10 * n);
}

/**
 * Determine point during animation curve.
 *
 * @param {number} v from 0-1 in animation
 * @return {number} from 0-1
 */
function invertOutExpo(v) {
  v = (v * -1) + 1;
  return Math.log2(v) / -10;
}

export class SantaCardPlayerElement extends HTMLElement {
  static get observedAttributes() { return ['active', 'scene']; }

  constructor() {
    super();

    this._anim = emptyAnim;
    this.resize = () => {};

    this._animationStart = 0.0;
    this._animate = this._animate.bind(this);
  }

  /**
   * requestAnimationFrame callback that controls the intro animation.
   *
   * @param {!DOMHighResTimeStamp} now
   */
  _animate(now) {
    const duration = this._anim.getDuration(false) * 1000;
    const ratio = (now - this._animationStart) / duration;

    if (ratio >= 1.0) {
      this._animationStart = 0.0;
    } else {
      window.requestAnimationFrame(this._animate);
    }

    if (duration) {
      const raw = outExpo(ratio);
      const v = this.active ? raw : 1 - raw;
      const frame = this._anim.getDuration(true) * v;
      this._anim.goToAndStop(Math.max(0, frame), true);
    }
  }

  get active() {
    return this.hasAttribute('active');
  }

  set active(active) {
    this.toggleAttribute('active', active);
  }

  get scene() {
    return this.getAttribute('scene');
  }

  set scene(scene) {
    if (scene) {
      this.setAttribute('scene', scene);
    } else {
      this.removeAttribute('scene');
    }
  }

  _updateActive() {
    // nb. This assumes active has changed.
    if (!this._animationStart) {
      window.requestAnimationFrame(this._animate);
      this._animationStart = performance.now();
    } else {
      const now = performance.now();
      const durationPassed = now - this._animationStart;
      const duration = this._anim.getDuration(false) * 1000;

      // Find where along the curve we were, and invert it for the opposite direction, to find the
      // point along the *inverse* curve to start at.
      const adjustedRatio = outExpo(durationPassed / duration);
      const startAt = invertOutExpo(1 - adjustedRatio);

      // Move backwards in time by the amount of the animation we've already skipped.
      this._animationStart = now - (startAt * duration);
    }
  }

  _updateAnim() {
    this._anim.destroy();

    if (!this.scene || !this.isConnected) {
      this._anim = emptyAnim;
      this.resize = () => {};
      return;
    }

    const src = assetRoot + this.getAttribute('scene') + '.json';
    const anim = loadAnimation(src, {
      container: this,
    });
    this._anim = anim;

    this._anim.addEventListener('DOMLoaded', () => {
      window.requestAnimationFrame(() => {
        if (this._anim === anim) {
          this.dispatchEvent(new CustomEvent('load'));
        }
      });
    });
    this._anim.addEventListener('data_failed', () => {
      if (this._anim === anim) {
        console.warn('got data_failed', this._anim, anim);
        this.dispatchEvent(new CustomEvent('error'));
      }
    });

    this.resize = buildSafeResize(anim);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    switch (attrName) {
      case 'active':
        this._updateActive();
        break;

      case 'scene':
        this._updateAnim();
        break;
    }
  }

  connectedCallback() {
    this._updateAnim();
    globalResizeObserver.observe(this);
  }

  disconnectedCallback() {
    this._updateAnim();  // destroys animation when removed from DOM
    globalResizeObserver.unobserve(this);
  }
}

customElements.define('santa-card-player', SantaCardPlayerElement);