import {LitElement, html} from "lit-element";
import styles from './modvil-arrow.css';


class ModvilArrowElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      target: {type: String},
      dir: {type: String},
    };
  }

  constructor() {
    super();
    this._uniqueId = '_id_' + Math.random();
  }

  render() {
    return html`
<div class="row">
  <button id=${this._uniqueId} class="arrow ${this.dir}" @click=${this._onClick}></button>
  <label for=${this._uniqueId}><slot></slot></label>
</div>
`;
  }

  _onClick() {
    if (!this.target) {
      return;
    }
    let target;
    if (typeof this.target === 'string') {
      target = document.getElementById(this.target);
      if (!target) {
        return;
      }
    } else {
      target = this.target;
    }

    target.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}

customElements.define('modvil-arrow', ModvilArrowElement);