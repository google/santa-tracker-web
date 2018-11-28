import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';


import * as prefix from '../../../src/lib/prefix.js';


import * as defs from '../defs.js';


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

      categoryChoice: {type: Object},

      svgStyle: {type: String},

      _previews: {type: Object},
    };
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();

    this.categoryChoice = {
      body: 0,
      hair: 0,
      eyes: 0,
      ears: 0,
      hats: 0,
      accessories: 0,
    };

    this.skinTone = defs.random('skin');
    this.hairColor = defs.random('hair');
    this.suitColor = defs.random('color');
    this.eyesColor = defs.random('color');
    this.earsColor = defs.random('color');
    this.hatsColor = defs.random('color');
    this.accessoriesColor = defs.random('color');
  }

  renderSvgStyle() {
    const renderClass = (name, prop, value) => {
      const colors = defs.colors[value];
      return colors.map((color, i) => `.${name}${i || ''}{${prop}:${color}}`).join('');
    };
    return `
${renderClass('suit', 'fill', this.suitColor)}
${renderClass('hats', 'fill', this.hatsColor)}
${renderClass('limb', 'stroke', this.suitColor)}
${renderClass('skin', 'fill', this.skinTone)}
${renderClass('hair', 'fill', this.hairColor)}
${renderClass('accessories', 'fill', this.accessoriesColor)}
    `;
  }

  update(changedProperties) {
    for (const k of changedProperties.keys()) {
      if (k[0] !== '_') {
        this.svgStyle = this.renderSvgStyle();
        this.dispatchEvent(new CustomEvent('change'));
        break;
      }
    }

    if (changedProperties.has('category')) {
      switch (this.category) {
        case 'hats':
          this._previews = defs.hats;
          break;
        case 'hair':
          this._previews = defs.hair;
          break;
        case 'accessories':
          this._previews = defs.accessories;
          break;
        default:
          this._previews = [];
      }
    }
    this.playChangeSound(changedProperties);
    return super.update(changedProperties);
  }
  playChangeSound(changedProperties) {
    if (changedProperties.has('category')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_type');
    }else if (changedProperties.has('categoryChoice')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_item');
    }else {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_color');
    }
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

  _onPreviewChange(ev) {
    this.categoryChoice = Object.freeze({
      ...this.categoryChoice,
      [this.category]: +ev.target.value,
    });
  }

  render() {
    const indent = 35;
    const lowerIndent = 40;

    const inner = this._renderCategory(this.category);
    const choice = this.categoryChoice[this.category] || 0;;
    const previews = repeat(this._previews, (p, i) => `${this.category}${i}`, (p, i) => {
      let front = '';
      let back = '';

      if (this.category === 'hair' || this.category === 'accessories') {
        front = p;
      } else {
        back = p;
      }

      return html`
<label class="item">
  <input type="radio" name="${this._idPrefix}preview" value=${i} .checked=${choice === i} />
  <div class="preview">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${indent} 0 ${210 - indent * 2} ${345 - lowerIndent}">
<g class=${this.category}>${back}</g>
${defs.head}
<g class=${this.category}>${front}</g>
</svg>
  </div>
</label>
      `;
    });

    return html`
<style>${_style`maker-control`}</style>
<style>${defs.baseSvgStyle}${this.svgStyle}</style>
<main>
  ${this._chooser('category', 'category')}
  ${inner}
  <div class="previews" @change=${this._onPreviewChange}>${previews}</div>
</main>
    `;
  }
}

customElements.define('maker-control', MakerControlElement);
