import {LitElement, html} from "lit-element";
import styles from './modvil-tracker-photo.css';
import * as common from '../../../src/core/common.js';
import {_static, _msg} from '../../../src/magic.js';
import {prepareAsset} from '../../../src/lib/media.js';
import * as promises from '../../../src/lib/promises.js';


common.preload.images(
  _static`img/tracker/localguides.svg`,
);


class ModvilTrackerPhotoElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      attributionHtml: {type: String},
    };
  }

  render() {
    return html`
<div class="inner"><slot></slot></div>
    `;
  }
}

customElements.define('modvil-tracker-photo', ModvilTrackerPhotoElement);