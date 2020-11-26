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

import {html, LitElement} from 'lit-element';
import * as defs from '../defs.js';

import styles from './maker-photo.css';


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
    this.shadowRoot.adoptedStyleSheets = [styles];

    this._hidden = true;
    this._recentImageSrc = null;
  }

  dismiss() {
    if (!this._hidden) {
      this._hide();
    }
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
