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

import { BasicElement } from '../utils/basic-element.js';
import { Gamelike } from '../utils/gamelike.js';
import { RenderSystem } from '../systems/render-system.js';
import { ClockSystem } from '../systems/clock-system.js';
import { InputSystem } from '../systems/input-system.js';

const {
  PerspectiveCamera,
  OrthographicCamera
} = self.THREE;

const template = document.createElement('template');

template.innerHTML = `
<style>
  :host {
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  *[hidden] {
    display: none;
  }
</style>`;

/**
 * @constructor
 * @extends {BasicElement}
 * @implements GamelikeInterface
 */
const GamelikeBasicElement = Gamelike(BasicElement);

export class Game extends GamelikeBasicElement {
  static get template() { return template; }

  constructor(...args) {
    super(...args);

    this.stampTemplate();
    this.renderSystem = new RenderSystem();
    this.inputSystem = new InputSystem();

    this.camera = new OrthographicCamera(1, 1, 1, 1, 1, 100000);

    this.shadowRoot.appendChild(this.renderSystem);
    this.shadowRoot.appendChild(this.inputSystem);

    self.addEventListener('resize', () => this.measure());
  }

  connectedCallback() {
    this.measure();
  }

  measure() {
    this.width = self.innerWidth;
    this.height = self.innerHeight;

    if (this.currentLevel != null) {
      this.currentLevel.measure(this);
    }

    this.camera.aspect = this.width / this.height;
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.renderSystem.measure(this);
  }

  update() {
    this.currentLevel.update(this);
    this.renderSystem.update(this);
    this.inputSystem.update(this);
  }

  teardown() {
    super.teardown();

    if (this.currentLevel != null) {
      this.setLevel(null);
    }

    this.inputSystem.teardown(this);
    this.renderSystem.teardown(this);
  }

  setLevel(level) {
    super.setLevel(level);

    if (level != null) {
      this.camera.position.copy(level.position);
      this.camera.position.z = -3200;
      this.camera.lookAt(level.position);
      this.camera.rotation.z = 0;
    }
  }
}
