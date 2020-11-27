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
@keyframes float {
  0% {
    transform: rotate(-5deg);
  }

  50% {
    transform: rotate(5deg);
  }

  100% {
    transform: rotate(-5deg);
  }
}

@keyframes drag {
  0% {
    transform: translateY(-5%);
  }

  50% {
    transform: translateY(5%);
  }

  100% {
    transform: translateY(-5%);
  }
}

:host {
  display: flex;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-family: Lobster;
  color: #fff;
}

.container {
  margin: auto;
  text-align: center;
  font-size: 2em;
}

:host(.hide-population) h1 {
  transition: none;
  opacity: 0;
  transform: translateY(10px);
}

h1 {
  transition: opacity 0.3s, transform 0.3s;
  font-size: 4em;
  transform: translateY(0px);
}

h2 > span {
  display: block;
}

#elf {
  display: block;
  margin: auto;
  width: 256px;
  height: 256px;
  animation: drag 5s ease-in-out infinite;
}

#elf:after {
  content: '';
  display: block;
  width: 256px;
  height: 256px;
  background-image: url(${assetBaseUrl}img/elves-parachuting.svg);
  background-size: 200%;

  transform-origin: center 20%;
  animation: float 3s ease-in-out infinite;
}
</style>
<div class="container">
  <div id="elf"></div>
  <h1><span id="present"></span>/<span id="needed"></span></h1>
  <h2>
    <span>Waiting for more</span>
    <span>elves to join</span>
  </h2>
</div>`;
}

export class LobbyStatus extends EntityElement {
  static get is() { return 'lobby-status'; }

  static get template() { return template; }

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
      this.present = this.shadowRoot.querySelector('#present');
      this.needed = this.shadowRoot.querySelector('#needed');
    }
  }

  update(game) {
    const { stateSystem } = game;

    if (this.present && this.needed && stateSystem.hasCurrentPopulation) {
      this.classList.remove('hide-population');
      this.present.textContent = stateSystem.population.allTime;
      this.needed.textContent = stateSystem.population.maximum;
    } else {
      this.classList.add('hide-population');
    }
  }
};

customElements.define(LobbyStatus.is, LobbyStatus);
