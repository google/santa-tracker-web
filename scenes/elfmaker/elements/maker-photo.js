import {html, LitElement} from '@polymer/lit-element';
import * as defs from '../defs.js';


export class MakerPhotoElement extends LitElement {
  static get properties() {
    return {
      _flashing: {type: Boolean},
      _hidden: {type: Boolean},
      _image: {type: Image},
    };
  }

  constructor() {
    super();
    this._hidden = true;
    this._recentImageSrc = null;
  }

  _hide() {
    this._hidden = true;
    this._recentImageSrc = null;
    this.dispatchEvent(new Event('hide'));
  }

  /**
   * @return {!Promise<string>}
   */
  get recentImage() {
    return this._recentImageSrc;
  }

  _flashTransitionend() {
    if (this._flashing) {
      this._activeResolve();
    }
  }

  async capture(imageSrc) {
    if (this._flashing) {
      return;  // do nothing
    }
    this._recentImageSrc = imageSrc;

    window.santaApp.fire('sound-trigger', 'elfmaker_photo');

    const flash = new Promise((resolve) => {
      this._activeResolve = resolve;
      this._flashing = true;
    });

    const image = new Image();
    image.width = defs.width;
    image.height = defs.height;
    image.src = await imageSrc;

    await flash;
    this._flashing = false;
    this._hidden = false;
    this._image = image;
  }

  render() {
    return html`
<style>${_style`maker-photo`}</style>
<div class="flash" ?fill=${this._flashing} @transitionend=${this._flashTransitionend}></div>
<div class="position">
  <div class="anim">
    <label class="outline" ?hidden=${this._hidden} @click=${this._hide}>
      <div class="inner">${this._image}</div>
    </label>
  </div>
</div>
    `;
  }
}

customElements.define('maker-photo', MakerPhotoElement);
