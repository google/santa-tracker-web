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
import * as common from '../../src/core/common.js';
import styles from './santa-button.css';


function createSvgIcon(d) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  return svg;
}


export class SantaButtonElement extends LitElement {
  static get styles() {
    return [styles];
  }

  static get properties() {
    return {
      path: {type: String},
      color: {type: String},
      disabled: {type: Boolean, reflect: true},
    };
  }

  constructor() {
    super();
    this.path = '';

    this.addEventListener('mouseenter', () => {
      common.play('generic_button_over');
    });
    this.addEventListener('mousedown', () => {
      common.play('generic_button_click');
    });
    this.addEventListener('touchdown', () => {
      common.play('generic_button_click');
    });
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('path')) {
      if (this.path) {
        this._lastPath = changedProperties.get('path');
      } else {
        // If we're no longer using paths, just clear it immediately.
        this._lastPath = undefined;
      }
    }

    return super.shouldUpdate(changedProperties);
  }

  render() {
    let inner;

    if (this.path) {
      // TODO: transition to last path
      inner = html`<svg class="icon curr"><path d=${this.path || ''} /></svg>`;
    } else {
      inner = html`<slot></slot>`;
    }


    return html`<button class="${this.color || ''}" .disabled=${this.disabled} @click=${this._maybePreventClick}>${inner}</button>`;
  }

  focus() {
    this.shadowRoot.querySelector('button').focus();
  }

  _maybePreventClick(event) {
    if (this.disabled) {
      event.stopImmediatePropagation();
    }
  }
}


customElements.define('santa-button', SantaButtonElement);
