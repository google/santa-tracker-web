import loadLottie from '../deps/lottie.js';

export function outExpo(n) {
  return 1.0 === n ? n : 1.0 - Math.pow(2, -10 * n);
}

export function invertOutExpo(v) {
  v = (v * -1) + 1;
  return Math.log2(v) / -10;
}

async function prepareAnimation(path, container) {
  const lottie = await loadLottie();

  const anim = lottie.loadAnimation({
    path,
    renderer: 'svg',
    container,
    autoplay: false,
  });

  return new Promise((resolve, reject) => {
    anim.addEventListener('DOMLoaded', () => resolve(anim));
    anim.addEventListener('data_failed', reject);
  });
}

export class SantaCardPlayerElement extends HTMLElement {
  constructor() {
    super();

    this._active = false;

    this._looping = false;
    this._introAnimationStart = 0.0;
    this._direction = 1;

    this.addEventListener('pointerenter', () => this._setActive(true), {
      capture: true,
    });
    this.addEventListener('pointerleave', () => this._setActive(false));

    this._pendingLoad = null;

    this._introAnim = undefined;
    this._loopAnim = undefined;

    this._animate = this._animate.bind(this);
  }

  _animate(now) {
    const duration = this._introAnim.getDuration(false) * 1000;
    let ratio = (now - this._introAnimationStart) / duration;

    if (ratio >= 1.0) {
      this._introAnimationStart = 0;
    }

    const raw = outExpo(ratio);
    const v = this._direction === -1 ? (1 - raw) : raw;

    const frame = this._introAnim.getDuration(true) * v;
    this._introAnim.goToAndStop(Math.max(0, frame), true);

    if (this._introAnimationStart) {
      window.requestAnimationFrame(this._animate);
    }
  }

  _setActive(active) {
    if (active === this._active) {
      return;
    }
    this._active = active;

    if (active) {
      this._direction = +1;
    } else {
      this._direction = -1;
    }

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

  _prepare() {
    prepareAnimation(this.getAttribute('intro-src'), this).then((anim) => {
      this._introAnim = anim;
    }).catch((err) => {
      console.warn('cannot load intro');
      this._introAnim = null;
    });
  }

  connectedCallback() {
    if (this._introAnim === undefined) {
      this._prepare();
    }
  }

  disconnectedCallback() {

  }
}

customElements.define('santa-card-player', SantaCardPlayerElement);