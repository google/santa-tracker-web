import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';


import * as prefix from '../../../src/lib/prefix.js';

import * as defs from '../defs.js';


export const options = Object.freeze({
  'category': ['body', 'hair', 'eyes', 'ears', 'hats', 'accessories'],
  'skin': ['#faddbd', '#debb95', '#bf8f69', '#9a653d', '#584638'],
  'color': ['#ff3334', '#ff7733', '#ffe04d', '#31a658', '#00acc2', '#339aff', '#6f00ff', '#ad01ad', '#4e3e3e'],
  'hair': ['#f5be1b', '#f57c01', '#f57455', '#a14343', '#853f4a', '#774c2e', '#342e2e', '#f5f5f5'],
});


export function randomOption(category) {
  const o = options[category] || [];
  const choice = ~~(Math.random() * o.length);
  return o[choice] || null;
}


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
      this._options = options[this.mode] || [];
    }
    return super.update(changedProperties);
  }

  render() {
    const buttons = repeat(this._options, (r) => r, (r) => {
      let style = '';
      if (r[0] === '#') {
        style = `background-color: ${r}`;
      }
      return html`
        <label class="item">
          <input type="radio" name="${this._idPrefix}choice" value="${r}" .checked=${this.value === r} />
          <div class="opt value-${r}" style="${style}"></div>
        </label>
        `;
    });
    return html`
<style>${_style`maker-chooser`}</style>
<main class="mode-${this.mode}" @change=${this._onChange}>${buttons}</main>
    `;
  }
}

customElements.define('maker-chooser', MakerChooserElement);
