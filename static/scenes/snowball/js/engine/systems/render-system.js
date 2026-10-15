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

const {
  WebGLRenderer,
} = self.THREE;

const template = document.createElement('template');

template.innerHTML = `
<style>
  :host, canvas {
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
  }
</style>
`;

export class RenderSystem extends BasicElement {
  static get is() { return 'render-system'; }

  static get template() { return template }

  get aspectRatio() {
    return this.width / this.height;
  }

  constructor() {
    super();

    this.stampTemplate();
    // Antialiasing is off by default, and without it every polygon silhouette
    // stair-steps. It goes unnoticed on the elves and trees, whose edges are
    // busy and low contrast, but a straight edge against the snow shows it
    // immediately. The scene is cheap to draw -- unlit basic materials, no
    // shadows -- so the multisample cost is worth paying.
    this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.autoClear = true;
    this.shadowRoot.appendChild(this.renderer.domElement);
  }

  measure(game) {
    this.width = self.innerWidth;
    this.height = self.innerHeight;

    this.renderer.setPixelRatio(self.devicePixelRatio);
    this.renderer.setSize(this.width, this.height, true);
  }

  update(game) {
    const { currentLevel, camera } = game;
    this.renderer.render(currentLevel, camera);
  }

  teardown(game) {}

  clear() {
    this.renderer.clearColor();
  }
};

customElements.define(RenderSystem.is, RenderSystem);
