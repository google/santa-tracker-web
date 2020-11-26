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
import {repeat} from 'lit-html/directives/repeat';
import styles from './maker-chooser.css';


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

  static get styles() { return [styles]; };

  constructor() {
    super();
    this._idPrefix = prefix.id();
    this._options = [];
    this.mode = '';
    this.value = '';
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
<main class="mode-${this.mode}" @change=${this._onChange}>
  <div class="row">${buttonsHigh}</div>
  <div class="row">${buttonsLow}</div>
</main>
    `;
  }
}

customElements.define('maker-chooser', MakerChooserElement);
