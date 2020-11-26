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

import {LitElement, html} from "lit-element";
import styles from './modvil-arrow.css';


class ModvilArrowElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      target: {type: String},
      dir: {type: String},
    };
  }

  constructor() {
    super();
    this._uniqueId = '_id_' + Math.random();
  }

  render() {
    return html`
<div class="row">
  <button id=${this._uniqueId} class="arrow ${this.dir}" @click=${this._onClick}></button>
  <label for=${this._uniqueId}><slot></slot></label>
</div>
`;
  }

  _onClick() {
    if (!this.target) {
      return;
    }
    let target;
    if (typeof this.target === 'string') {
      target = document.getElementById(this.target);
      if (!target) {
        return;
      }
    } else {
      target = this.target;
    }

    target.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}

customElements.define('modvil-arrow', ModvilArrowElement);