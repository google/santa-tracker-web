import {html, LitElement} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

import {getLanguage, runtimeTranslate} from '../lib/runtime.js';
import * as route from '../route.js';

export class SantaOverlayElement extends LitElement {
  static get properties() {
    return {
      todayHouse: {type: String},
      trackerIsOpen: {type: Boolean},
    };
  }

  render() {
    return html`
`;
  }
}


customElements.define('santa-overlay', SantaOverlayElement);
