import '../../../src/elements/santa-choice.js';

import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';

import * as prefix from '../../../src/lib/prefix.js';
import * as defs from '../defs.js';

export const parseQueryString = () =>
    window.location.search.slice(1).split('&').reduce((query, part) => {
      const [key, value] = part.split('=');
      query[key] = value;
      return query;
    }, {});

const categoryNames = [
  'body',
  'hair',
  'glasses',
  'eyes',
  'ears',
  'hats',
  'accessories',
  'backgrounds',
];

const colorProperties = {
  'skinTone': 'skin',
  'hairColor': 'hair',
  'suitColor': 'color',
  'glassesColor': 'glasses',
  'earsColor': 'color',
  'hatsColor': 'color',
  'accessoriesColor': 'color'
};

const colorPropertyNames = Object.keys(colorProperties);

const defaultCategoryChoices = () => categoryNames.reduce((defaultChoice, categoryName) => {
  defaultChoice[categoryName] = 0;
  return defaultChoice;
}, {});

const defaultPropertyColors = () =>
    Object.keys(colorProperties).reduce((propertyColors, property) => {
      propertyColors[property] = defs.random(colorProperties[property]);
      return propertyColors;
    }, {});

const deserializeQueryStringState = () => {
  const categoryChoices = defaultCategoryChoices();
  const propertyColors = defaultPropertyColors();

  if (window.location.search) {
    const {elf} = parseQueryString();

    if (elf != null) {
      elf.split(',').forEach((choiceString, index) => {
        if (index < categoryNames.length) {
          const feature = categoryNames[index];
          categoryChoices[feature] = self.parseInt(choiceString, 10);
        } else {
          const propertyIndex = index - categoryNames.length;
          const property = colorPropertyNames[propertyIndex];
          propertyColors[property] = choiceString;
        }
      });
    }
  }

  return [categoryChoices, propertyColors];
};

export class MakerControlElement extends LitElement {
  static get properties() {
    return {
      _idPrefix: {type: String},
      category: {type: String},

      skinTone: {type: String},
      hairColor: {type: String},
      suitColor: {type: String},
      glassesColor: {type: String},
      earsColor: {type: String},
      hatsColor: {type: String},
      accessoriesColor: {type: String},

      categoryChoice: {type: Object},

      svgStyle: {type: String},

      _previews: {type: Object},
    };
  }

  serializeState() {
    const serialized = [];

    categoryNames.forEach((categoryName) => {
      serialized.push(this.categoryChoice[categoryName]);
    });

    colorPropertyNames.forEach((colorPropertyName) => {
      serialized.push(this[colorPropertyName]);
    });

    return serialized.join(',');
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();

    const [categoryChoice, propertyColors] =
        deserializeQueryStringState(categoryNames, colorProperties);

    this.categoryChoice = categoryChoice;
    Object.assign(this, propertyColors);
  }

  renderSvgStyle() {
    const renderClass = (name, prop, value) => {
      const colors = defs.colors[value];
      return colors.map((color, i) => `.${name}${i || ''}{${prop}:${color}}`).join('');
    };
    return `
${renderClass('suit', 'fill', this.suitColor)}
${renderClass('hats', 'fill', this.hatsColor)}
${renderClass('glasses', 'fill', this.glassesColor)}
.glasses-stroke {
  fill: none; stroke: ${defs.colors[this.glassesColor][0]}; stroke-width: 5px;
}
${renderClass('ears', 'fill', this.earsColor)}
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
        case 'body':
          this._previews = defs.bodyPreviews;
          break;
        case 'hats':
          this._previews = defs.hats;
          break;
        case 'hair':
          this._previews = defs.hair;
          break;
        case 'glasses':
          this._previews = defs.glasses;
          break;
        case 'ears':
          this._previews = defs.ears;
          break;
        case 'accessories':
          this._previews = defs.accessories;
          break;
        case 'backgrounds':
          this._previews = defs.backgrounds;
          break;
        default:
          this._previews = [];
      }
    }
    this.playChangeSound(changedProperties);
    return super.update(changedProperties);
  }

  playChangeSound(changedProperties) {
    if (changedProperties.has('_idPrefix')) return; //first event, play no sound
    if (changedProperties.has('category')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_type');
    } else if (changedProperties.has('categoryChoice')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_item');
    } else {
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
        `;
      case 'color':
        return html`
          ${this._chooser('suitColor', 'color')}
        `;
      case 'hair':
        return html`
          ${this._chooser('hairColor', 'hair')}
        `;
      case 'glasses':
        return html`
          ${this._chooser('glassesColor', 'glasses')}
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
    // all category types except 'body' use the shared elf head to preview look, so override sizes
    // for displaying a larger elf body
    const lowerIndent = (this.category === 'hats' ? 0 : 80);
    const head = (this.category !== 'body') ? defs.head : '';

    const inner = this._renderCategory(this.category);
    const choice = this.categoryChoice[this.category] || 0;

    const previews = repeat(this._previews, (p, i) => `${this.category}${i}`, (p, i) => {
      let front = '';
      let back = '';

      if (this.category === 'hats') {
        back = p;
      } else {
        front = p;
      }

      return html`
<label class="item">
  <input type="radio" name="${this._idPrefix}preview" value=${i} .checked=${choice === i} />
  <div class="preview">
    ${this.category === 'backgrounds' ? html`
<img src=${p}>
    ` : html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${defs.width * 0.2} ${lowerIndent} ${defs.width * 0.6} ${345 - lowerIndent}">
<g transform="translate(55)">
  <g class=${this.category}>${back}</g>
  ${head}
  <g class=${this.category}>${front}</g>
</g>
</svg>
    `}
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

  <santa-choice>
    <div class="previews" @change=${this._onPreviewChange}>
      ${previews}
    </div>
  </santa-choice>
</main>
    `;
  }
}

customElements.define('maker-control', MakerControlElement);
