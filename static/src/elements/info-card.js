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
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './info-card.css';


export class InfoCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Boolean},
      href: {type: String},
      src: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  render() {
    const href = (!this.locked && this.href) || undefined;
    return html`
<div class="card">
  <a href=${ifDefined(href)}>
    <div class="background" style="background-image: url(${this.src})">
      <div class="lock" ?hidden=${!this.locked}></div>
    </div>
  </a>
  <div class="info"><slot></slot></div>
</div>
`;
  }
}

customElements.define('info-card', InfoCardElement);
