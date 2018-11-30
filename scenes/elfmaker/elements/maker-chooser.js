import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';


import * as prefix from '../../../src/lib/prefix.js';
import * as defs from '../defs.js';


export const categories = Object.freeze([
  'body',
  'suit',
  'hair',
  'glasses',
  'ears',
  'hats',
  'accessories',
  'backgrounds',
]);


export class MakerChooserElement extends LitElement {
  static get properties() {
    return {
      mode: {type: String},
      _idPrefix: {type: String},
      _options: {type: Array},
      value: {type: String},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();
    this._options = [];
  }

  _onChange(event) {
    this.value = event.target.value;
    this._announceChange();
  }

  _announceChange() {
    this.dispatchEvent(new CustomEvent('change', {detail: this}));
  }

  update(changedProperties) {
    if (changedProperties.has('mode')) {
      if (this.mode === 'category') {
        this._options = categories;
      } else {
        this._options = defs.options[this.mode];
      }
    }
    return super.update(changedProperties);
  }

  render() {
    const renderButton = (r) => {
      let style = '';
      if (this.mode !== 'category') {
        const colors = defs.colors[r];
        style = `background-color: ${colors[0]}`;
      }
      return html`
<label class="item">
  <input type="radio" name="${this._idPrefix}choice" value="${r}" .checked=${this.value === r} />
  <div class="opt value-${r}" style="${style}"></div>
</label>
        `;
    };

    const half = Math.ceil(this._options.length / 2)
    const buttonsHigh = repeat(this._options.slice(0, half), (r) => r, renderButton);
    const buttonsLow = repeat(this._options.slice(half), (r) => r, renderButton);
    return html`
<style>${_style`maker-chooser`}</style>
<main class="mode-${this.mode}" @change=${this._onChange}>
  <div class="row">${buttonsHigh}</div>
  <div class="row">${buttonsLow}</div>
</main>
    `;
  }
}

customElements.define('maker-chooser', MakerChooserElement);
