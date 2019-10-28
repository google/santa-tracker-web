import loadLottie from '../deps/lottie.js';
import { prepare } from '../kplay.js';

export function outExpo(n) {
  return 1.0 === n ? n : 1.0 - Math.pow(2, -10 * n);
}

export function invertOutExpo(v) {
  v = (v * -1) + 1;
  return Math.log2(v) / -10;
}

function toggleLottieVisible(lottie, visible) {
  if (!lottie) {
    return;
  }
  const el = lottie.renderer.svgElement;
  if (visible) {
    el.removeAttribute('hidden');
  } else {
    el.setAttribute('hidden', '');
  }
}

async function prepareAnimation(path, container, options = {}) {
  const lottie = await loadLottie();

  const anim = lottie.loadAnimation(Object.assign({
    path,
    renderer: 'svg',
    container,
    autoplay: false,
  }, options));

  // Lottie creates its SVG immediately, but doesn't render until later, so it
  // can be marked hidden.
  toggleLottieVisible(anim, false);

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

    this._pendingLoopAnim = null;
    this._pendingIntroAnim = null;
    this._introAnim = undefined;

    this._animate = this._animate.bind(this);
  }

  _startLoop(loop) {
    toggleLottieVisible(this._introAnim, false);
    toggleLottieVisible(loop, true);
    loop.play();
  }

  /**
   * Fires on every loop of the looping animation.
   */
  _onLoopComplete() {
    if (this._active) {
      return;
    }

    this._pendingLoopAnim.then((loop) => {
      loop.stop();

      if (this._introAnim) {
        toggleLottieVisible(loop, false);

      } else {
      }
      if (this._introAnim && !this._active) {
        // start animating
      }
      });

  }

  /**
   * requestAnimationFrame callback that controls the intro animation.
   *
   * @param {!DOMHighResTimeStamp} now
   */
  _animate(now) {
    const duration = this._introAnim.getDuration(false) * 1000;
    let ratio = (now - this._introAnimationStart) / duration;

    if (ratio >= 1.0) {
      this._introAnimationStart = 0;

      if (this._direction > 0) {
        this._pendingLoopAnim.then((loop) => {
          if (this._direction === 1 && !this._introAnimationStart) {
            this._startLoop(loop);
          }
        });
      }

    } else {
      window.requestAnimationFrame(this._animate);
    }

    const raw = outExpo(ratio);
    const v = this._direction === -1 ? (1 - raw) : raw;

    const frame = this._introAnim.getDuration(true) * v;
    this._introAnim.goToAndStop(Math.max(0, frame), true);
  }

  _setActive(active) {
    if (active === this._active) {
      return;
    }
    this._active = active;

    if (active) {
      this._ensureLoopAnim();  // load the loop animation during the intro
      this._direction = +1;
    } else {
      this._direction = -1;

      if (this._active) {
        this._pendingLoopAnim.then((loop) => {
          loop.setSpeed(8);
        });
        this._looping = false;
        return;
      }
    }

    if (this._introAnim === undefined) {
      return;  // nothing to do
    }

    toggleLottieVisible(this._introAnim, true);

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

  _ensureLoopAnim() {
    if (!this._pendingLoopAnim) {
      const loopSrc = this.getAttribute('loop-src');

      this._pendingLoopAnim = prepareAnimation(loopSrc, this, {loop: true}).catch((err) => {
        return null;
      }).then((loop) => {
        if (loop) {
          loop.addEventListener('loopComplete', this._onLoopComplete.bind(this));
        }
      });
    }
    return this._pendingLoopAnim;
  }

  connectedCallback() {
    if (this._pendingIntroAnim) {
      return;
    }

    const introSrc = this.getAttribute('intro-src');

    this._pendingIntroAnim = prepareAnimation(introSrc, this).catch((err) => {
      // The intro animation failed, so swap to the loop animation.
      this._ensureLoopAnim();
      return null;
    }).then((anim) => {
      this._introAnim = anim;
      console.info('got intro anim', anim, 'active?', this._active);

      if (anim && this._active) {
        this._active = undefined;
        this._setActive(true);
      }
    });
  }

  disconnectedCallback() {

  }
}

customElements.define('santa-card-player', SantaCardPlayerElement);