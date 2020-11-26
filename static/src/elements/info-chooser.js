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
import styles from './info-chooser.css';


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

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
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
