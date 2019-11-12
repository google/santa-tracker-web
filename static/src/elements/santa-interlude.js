import styles from './santa-interlude.css';
import {_static} from '../../src/magic.js';
import {prepareAnimation} from '../../src/deps/lottie.js';

const layerCount = 4;

/**
 * Displays a random interlude.
 */
class SantaInterludeElement extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();

    const animationPromise = prepareAnimation(_static`img/interlude/loader.json`, {
      autoplay: true,
      loop: true,
    });

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

    this._loadingElement = Object.assign(document.createElement('div'), {className: 'progress'});
    lastLayer.append(this._loadingElement);

    this._hostElement.addEventListener('transitionend', (ev) => {
      if (this.active) {
        if (ev.target === lastLayer) {
          this._animateResolve(true);
        }
      } else if (ev.target === this._hostElement.firstElementChild) {
        this._onGone();
      }
    });

    if (this.hasAttribute('active')) {
      this.attributeChangedCallback('active', undefined, this.getAttribute('active'));
    }

    this._interludeAnimation = null;  // TODO: having a virtual future player would be nice
    animationPromise.then((anim) => {
      const svg = anim.renderer.svgElement;
      lastLayer.append(svg);
      this._interludeAnimation = anim;
    });

    this.shadowRoot.append(this._hostElement);
  }

  _onStart() {
    this._anyVisible = true;
    if (this._interludeAnimation) {
      this._interludeAnimation.play();
    }
  }

  _onStable() {
    // Since the animation has completed, invert the direction so it continues out the other way.
    this._hostElement.classList.add('direction');
  }

  _onGone() {
    this.setAttribute('data-loaded', '');
    this._anyVisible = false;

    if (this._interludeAnimation) {
      this._interludeAnimation.stop();
    }

    // Reset the direction for next animation.
    this._hostElement.remove();
    this._hostElement.classList.remove('direction');
    this.shadowRoot.append(this._hostElement);
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

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName !== 'active' || oldValue === newValue) {
      // nb. oldValue === newValue still gets callbacks?
      return;
    }

    if (this.active) {
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