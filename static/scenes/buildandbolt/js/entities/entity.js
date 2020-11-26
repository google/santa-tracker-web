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

goog.provide('app.Entity');

goog.require('app.Board');

app.Entity = class Entity {
  constructor() {
    this.elem = document.createElement('div');
    document.getElementById(this.constructor.targetHolderId).append(this.elem);
    this.elem.setAttribute('class', this.constructor.elemClass);
  }

  // for app.shared.pools
  onInit(config) {
    // all entities trigger action on cell by default
    this.config = config;

    this.elem.classList.remove('hidden');
    this.render();
    app.Board.addEntityToBoard(this,
        this.config.x, this.config.y,
        this.config.width, this.config.height);
  }

  // for app.shared.pools
  onDispose() {
    this.elem.classList.add('hidden');
  }

  onFrame() {

  }

  render() {

  }

  /**
   * Returns the action(s) that result from the player colliding with this entity,
   * or null if no effect.
   */
  onContact(player) {
    return null;
  }
}