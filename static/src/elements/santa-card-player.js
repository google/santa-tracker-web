import {loadAnimation} from '../deps/lottie.js';
import {_static} from '../magic.js';

const assetRoot = _static`img/card/`;

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
 * @return {numbe} from 0-1
 */
function invertOutExpo(v) {
  v = (v * -1) + 1;
  return Math.log2(v) / -10;
}

export class SantaCardPlayerElement extends HTMLElement {
  constructor() {
    super();

    this._active = false;
    this._introAnimationStart = 0.0;

    this._introAnim = null;

    this._animate = this._animate.bind(this);
  }

  /**
   * requestAnimationFrame callback that controls the intro animation.
   *
   * @param {!DOMHighResTimeStamp} now
   */
  _animate(now) {
    const duration = this._introAnim.getDuration(false) * 1000;
    const ratio = (now - this._introAnimationStart) / duration;

    if (ratio >= 1.0) {
      this._introAnimationStart = 0.0;
    } else {
      window.requestAnimationFrame(this._animate);
    }

    if (duration) {
      const raw = outExpo(ratio);
      const v = this._active ? raw : 1 - raw;
      const frame = this._introAnim.getDuration(true) * v;
      this._introAnim.goToAndStop(Math.max(0, frame), true);
    }
  }

  get active() {
    return this._active;
  }

  set active(active) {
    active = Boolean(active);
    if (active === this._active) {
      return;
    }
    this._active = active;

    if (!this._introAnimationStart) {
      window.requestAnimationFrame(this._animate);
      this._introAnimationStart = performance.now();
    } else {
      const now = performance.now();
      const durationPassed = now - this._introAnimationStart;
      const duration = this._introAnim.getDuration(false) * 1000;

      // Find where along the curve we were, and invert it for the opposite direction, to find the
      // point along the *inverse* curve to start at.
      const adjustedRatio = outExpo(durationPassed / duration);
      const startAt = invertOutExpo(1 - adjustedRatio);

      // Move backwards in time by the amount of the animation we've already skipped.
      this._introAnimationStart = now - (startAt * duration);
    }
  }

  connectedCallback() {
    if (!this._introAnim) {
      const src = assetRoot + this.getAttribute('scene') + '.json';
      this._introAnim = loadAnimation(src, {container: this});
      // TODO(samthor): fade in animation once it loads
    }
  }
}

customElements.define('santa-card-player', SantaCardPlayerElement);