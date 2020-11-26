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

const template = document.createElement('template');

template.innerHTML = `
<style>
:host {
  position: absolute;
  top: 0;
  right: 0;
}

#container {
  padding: 1em;
  margin: 3em;
  text-align: center;
  color: #fff;
  background-color: #68E4C1;
  font-family: 'Lobster';
  border-radius: 6px;
  box-shadow: 0px 4px 0px rgba(66, 66, 66, 0.5);
}

small {
  transform: scale(0.5);
}

h1 {
  font-size: 4em;
  margin: 0;
}

@media (max-width: 768px) {
  :host {
    transform-origin: top right;
    transform: scale(0.7);
  }
}
</style>
<div id="container">
  <h1><span id="remaining">0</span><small>/</small><span id="maximum">100</span></h1>
</div>
`;

export class PopulationUi extends EntityElement {
  static get is() { return 'population-ui'; }

  static get template() { return template; }

  constructor(...args) {
    super(...args);
    this.stampTemplate();
    this.remainingEl = this.shadowRoot.querySelector('#remaining');
    this.maximumEl = this.shadowRoot.querySelector('#maximum');
    this.remaining = this.maximum = 0;
  }

  update(game) {
    super.update(game);

    const { stateSystem } = game;
    const { population } = stateSystem;

    const { knockedOut, maximum } = population;
    const remaining = maximum - knockedOut;

    if (remaining !== this.remaining) {
      this.remaining = remaining;
      this.remainingEl.textContent = remaining;
    }

    if (maximum !== this.maximum) {
      this.maximum = maximum;
      this.maximumEl.textContent = maximum;
    }
  }
}

customElements.define(PopulationUi.is, PopulationUi);
