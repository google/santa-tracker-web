import {html, LitElement} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';


const spaceRe = /\s+/;

// nb. we hard-code a list of filter names for now
const names = {
  '': 'View All',
  'education': 'Education Focused',
  'android': 'Android',
  'new': 'New This Year',
  'geography': 'Geography',
  'computerscience': 'Computer Science',
  'language': 'Language',
  'socialstudies': 'Social Studies',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'ja': '日本語',
  'ko': '한국어',
};


export class InfoChooserElement extends LitElement {
  static get properties() {
    return {
      showAll: {type: Boolean},
      value: {type: String},
      choices: {type: String},
    };
  }

  _choiceChange(ev) {
    this.value = ev.target.value;
    this.dispatchEvent(new Event('change'));
  }

  choicesArray() {
    const array = this.choices.split(spaceRe);
    if (array[0] !== '' && this.showAll) {
      array.unshift('');
    }
    return Object.freeze(array);
  }

  get text() {
    return names[this.value] || '';
  }

  render() {
    const choices = this.choicesArray();

    // TODO(samthor): Does this work in polyfill mode?
    const children = Array.from(this.children);
    children.forEach((child) => {
      if (!this.value) {
        child.hidden = false;
      } else {
        const parts = (child.getAttribute('filter') || '').split(spaceRe);
        child.hidden = (parts.indexOf(this.value) === -1);
      }
    });

    return html`
<style>${_style`info-chooser`}</style>
<div class="chooser" @change=${this._choiceChange}>
${repeat(choices, (c) => c, (choice) => html`
  <label>
    <input type="radio" name="chooser" value="${choice}" ?checked=${choice === this.value} />
    <div>${names[choice] || '?'}</div>
  </label>
`)}
</div>

<div class="container"><slot></slot></div>
`;
  }
}

customElements.define('info-chooser', InfoChooserElement);
