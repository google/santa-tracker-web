import loadLottie from '../deps/lottie.js';

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

  if (!path) {
    return Promise.reject();
  }

  const anim = lottie.loadAnimation(Object.assign({
    path,
    renderer: 'svg',
    container,
    autoplay: false,
  }, options));

  // Lottie creates its SVG immediately, but doesn't render until later, so it
  // can be marked hidden right now.
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

    this._pendingIntroAnim = null;
    this._introAnim = undefined;

    this._pendingLoopAnim = null;
    this._loopAnim = undefined;

    this._animate = this._animate.bind(this);
  }

  /**
   * Fires on every loop of the looping animation.
   */
  _onLoopComplete() {
    if (this._active) {
      return;
    }

    this._loopAnim.stop();
    this._looping = false;

    if (this._introAnim) {
      toggleLottieVisible(this._introAnim, true);
      toggleLottieVisible(this._loopAnim, false);
    }

    window.requestAnimationFrame(this._animate);
    this._introAnimationStart = performance.now();
  }

  /**
   * requestAnimationFrame callback that controls the intro animation.
   *
   * @param {!DOMHighResTimeStamp} now
   */
  _animate(now) {
    const duration = this._introAnim ? this._introAnim.getDuration(false) * 1000 : 0;
    const ratio = (now - this._introAnimationStart) / duration;

    if (ratio >= 1.0) {
      this._introAnimationStart = 0;
      this._onAnimationComplete(this._active);
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

  _onAnimationComplete(active) {
    if (!active) {
      return;
    }

    this._looping = true;

    if (this._loopAnim) {
      toggleLottieVisible(this._loopAnim, true);
      toggleLottieVisible(this._introAnim, false);
      this._loopAnim.setSpeed(1);
      this._loopAnim.play();
    }
  }

  get active() {
    return this._active;
  }

  set active(active) {
    if (active === this._active) {
      return;
    }
    this._active = active;

    if (this._looping) {
      if (active) {
        // We were made active => inactive => active while still looping.
        this._loopAnim.setSpeed(1);
        return;
      } else if (this._loopAnim) {
        // Currently playing. Speed up and mark as done.
        this._loopAnim.setSpeed(8);
        return;
      }
      // There's no animation, stop immediately.
    }

    toggleLottieVisible(this._introAnim, true);

    this._looping = false;
    if (this._active) {
      this._ensureLoopAnim();
    }

    if (!this._introAnimationStart) {
      window.requestAnimationFrame(this._animate);
      this._introAnimationStart = performance.now();
    } else if (this._introAnim) {
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
        this._loopAnim = loop;
        if (!loop) {
          return;
        }

        loop.addEventListener('loopComplete', this._onLoopComplete.bind(this));

        if (this._active && this._looping) {
          toggleLottieVisible(this._introAnim, false);
          toggleLottieVisible(loop, true);

          loop.play();
        } else if (this._introAnim === null) {
          toggleLottieVisible(loop, true);
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
    }).then((intro) => {
      this._introAnim = intro;

      if (!this._looping || this._loopAnim === null) {
        toggleLottieVisible(intro, true);
      }
    });
  }

  disconnectedCallback() {

  }
}

customElements.define('santa-card-player', SantaCardPlayerElement);