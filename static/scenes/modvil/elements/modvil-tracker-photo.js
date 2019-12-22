import {LitElement, html} from 'lit-element';
import styles from './modvil-tracker-photo.css';
import * as common from '../../../src/core/common.js';
import {_static, _msg} from '../../../src/magic.js';
import {ifDefined} from 'lit-html/directives/if-defined';


common.preload.images(
  _static`img/tracker/localguides.svg`,
);


class ModvilTrackerPhotoElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      attributionHtml: {type: String},
      _href: {type: String},
      _author: {type: String},
      brand: {type: Boolean},
    };
  }

  constructor() {
    super();

    // TODO(samthor): Work out if the user is branded.
    this.brand = true;
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('attributionHtml')) {

      const div = document.createElement('div');
      div.innerHTML = this.attributionHtml;

      // We expect this to contain a single link and a name.

      const link = div.querySelector('a[href]');
      this._href = link ? link.href.toString() : undefined;
      this._author = div.textContent;
    }

    return true;
  }

  render() {
    return html`
<div class="inner">
  <slot></slot>
  <div class="attribution ${this.brand ? 'brand' : ''}">
    <a target="_blank" href=${ifDefined(this._href)}>${this._author}</a>
  </div>
</div>
    `;
  }
}

customElements.define('modvil-tracker-photo', ModvilTrackerPhotoElement);