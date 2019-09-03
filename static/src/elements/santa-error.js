import {html, LitElement} from "lit-element";
import styles from './santa-error.css';
import {_msg} from '../magic.js';
import {resolve} from '../route.js';

class SantaErrorElement extends LitElement {
  static get styles() {
    return [styles];
  }

  render() {
    return html`
<main>
  <div class="icon"></div>
  <p>${resolve(_msg`error-not-found`)}</p>
</main>
      `;
  }
}

customElements.define('santa-error', SantaErrorElement);