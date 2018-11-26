import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';


import * as prefix from '../../../src/lib/prefix.js';


import {randomOption} from './maker-chooser.js';


export class MakerControlElement extends LitElement {
  static get properties() {
    return {
      _idPrefix: {type: String},
      category: {type: String},

      skinTone: {type: String},
      hairColor: {type: String},
      suitColor: {type: String},
      eyesColor: {type: String},
      earsColor: {type: String},
      hatsColor: {type: String},
      accessoriesColor: {type: String},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();

    this.skinTone = randomOption('skin');
    this.hairColor = randomOption('hair');
    this.suitColor = randomOption('color');
    this.eyesColor = randomOption('color');
    this.earsColor = randomOption('color');
    this.hatsColor = randomOption('color');
    this.accessoriesColor = randomOption('color');
  }

  update(changedProperties) {
    this.dispatchEvent(new CustomEvent('change'));
    return super.update(changedProperties);
  }

  _categoryChange(ev) {
    this.category = ev.detail.value;
  }

  _chooser(prop, mode) {
    const change = (ev) => {
      this[prop] = ev.detail.value;
    };
    return html`
      <maker-chooser mode=${mode} value=${this[prop]} @change=${change}></maker-chooser>
    `;
  }

  _renderCategory(category) {
    switch (category) {
      case 'body':
        return html`
          ${this._chooser('skinTone', 'skin')}
          ${this._chooser('suitColor', 'color')}
        `;
      case 'hair':
        return html`
          ${this._chooser('hairColor', 'hair')}
        `;
      case 'eyes':
        return html`
          ${this._chooser('eyesColor', 'color')}
        `;
      case 'ears':
        return html`
          ${this._chooser('earsColor', 'color')}
        `;
      case 'hats':
        return html`
          ${this._chooser('hatsColor', 'color')}
        `;
      case 'accessories':
        return html`
          ${this._chooser('accessoriesColor', 'color')}
        `;
    }
    return '';
  }

  render() {
    const inner = this._renderCategory(this.category);

    return html`
<style>${_style`maker-control`}</style>
<main>
  ${this._chooser('category', 'category')}
  ${inner}
</main>
    `;
  }
}

customElements.define('maker-control', MakerControlElement);
