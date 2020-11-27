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

import { BasicElement } from '../../engine/utils/basic-element.js';
import { Entity } from '../../engine/core/entity.js';

/**
 * @constructor
 * @extends {BasicElement}
 * @implements {EntityInterface}
 */
const EntityElement = Entity(BasicElement);

let template = null;

const initializeTemplate = assetBaseUrl => {
  template = document.createElement('template');

  template.innerHTML = `
<style>
  :host {
    display: block;
    position: absolute;
    border-radius: 100%;
    width: 128px;
    height: calc(209/201 * 128px);
    background-image: url(${assetBaseUrl}img/item-frame.png);
    background-size: 100%;
    pointer-events: all;
  }

  .icon {
    position: absolute;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    width: 72px;
    height: 72px;
    top: 28px;
    left: 28px;
    background-size: 100%;
  }

  :host(.one) #one,
  :host(.two) #two,
  :host(.three) #three {
    opacity: 1;
  }

  :host(.two) #one {
    transform: scale(0.6) translate(-55%, -10%);
  }

  :host(.two) #two {
    transform: scale(0.6) translate(55%, 10%);
  }

  :host(.two.three) #one {
    transform: scale(0.5) translate(-40%, -40%);
  }

  :host(.two.three) #two {
    transform: scale(0.6) translate(45%, -10%);
  }

  :host(.three) #three {
    transform: scale(0.8) translate(0, 17.5%);
  }

  :host(.powerup-1) .icon {
    background-image: url(${assetBaseUrl}img/powerup-1.png);
  }
</style>
<div id="one" class="icon"></div>
<div id="two" class="icon"></div>
<div id="three" class="icon"></div>`;
};

export class PowerupStatus extends EntityElement {
  static get is() { return 'powerup-status'; }

  static get template() { return template; }

  constructor(...args) {
    super(...args);

    this.powerup = null;
    this.currentQuantity = 0;
  }

  connectedCallback() {
    if (template == null) {
      let parentNode = this.parentNode;
      while (parentNode && parentNode.tagName !== 'SNOWBALL-GAME') {
        if (parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          parentNode = parentNode.host;
        } else {
          parentNode = parentNode.parentNode;
        }
      }

      initializeTemplate(parentNode.assetBaseUrl);
    }

    if (this.shadowRoot == null) {
      this.stampTemplate();
    }
  }

  set value(powerup) {
    if (powerup == null) {
      this.powerup = powerup;
      this.currentQuantity = 0;
      this.classList.remove('one', 'two', 'three');
      return;
    }

    if (this.currentQuantity !== powerup.quantity) {
      this.classList.toggle('one', powerup.quantity >= 1);
      this.classList.toggle('two', powerup.quantity >= 2);
      this.classList.toggle('three', powerup.quantity >= 3);
      this.currentQuantity = powerup.quantity;
    }

    if (this.powerup === powerup) {
      return;
    }

    if (this.powerup != null) {
      this.classList.remove(`powerup-${this.powerup.type}`);
    }

    if (powerup != null) {
      this.classList.add(`powerup-${powerup.type}`);
    }

    this.powerup = powerup;
  }
};

customElements.define(PowerupStatus.is, PowerupStatus);
