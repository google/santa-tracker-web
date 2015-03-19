/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Present');

goog.require('app.shared.pools');

/**
 * Simple present graphic manager.
 * @param {app.Scene} scene which owns this present.
 * @constructor
 */
app.Present = function(scene) {
  this.el = Blockly.createSvgElement('svg', {
    'class': 'present',
    'viewBox': '0 0 61 40'
  }, null);
  var useEl = Blockly.createSvgElement('use', null, this.el);
  useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#maze-present');

  scene.presentsEl.appendChild(this.el);
};
app.shared.pools.mixin(app.Present);

/**
 * Initializes a present from the pool.
 * @param {number} x tile position.
 * @param {number} y tile position.
 * @param {number} level which employs this present.
 */
app.Present.prototype.onInit = function(x, y, level) {
  this.x = x;
  this.y = y;
  this.level = level;

  x = x * app.Scene.TILE_OUTER_SIZE;
  y = y * app.Scene.TILE_OUTER_SIZE;
  goog.style.setStyle(this.el, 'transform', 'translate(' + x + 'em, ' + y + 'em)');
  this.el.style.display = 'block';
};

/**
 * Resets the present so it can be released to the pool.
 */
app.Present.prototype.onDispose = function() {
  this.el.style.display = 'none';
};
