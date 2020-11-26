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
import styles from './easteregg-reindeer.css';

export class EasterEggReindeerElement extends LitElement {
  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  render() {
    return html`
<div id="holder">
  <div id="wrangler">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div id="reindeer1">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div id="reindeer2">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
    `;
  }
}

customElements.define('easteregg-reindeer', EasterEggReindeerElement);
