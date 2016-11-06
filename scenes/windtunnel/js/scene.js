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

goog.provide('app.Scene');

goog.require('app.Fan');
goog.require('app.FanStateManager');
goog.require('app.Rudolf');
goog.require('app.Snow');
goog.require('app.Snowblower');

/**
 * Main class for Windtunnel scene.
 *
 * @param {!Element} context DOM element that wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.rudolf = new app.Rudolf(
      /** @type {!Element} */ (context.querySelector('.rudolf-wrap')));

  this.snowblower = new app.Snowblower(
      /** @type {!Element} */ (context.querySelector('.snowblower')));

  this.fanStateManager = new app.FanStateManager(context, this.rudolf);
  this.fan = new app.Fan(
      /** @type {!Element} */ (context.querySelector('.fan-base')),
      this.fanStateManager);

  this.snow = new app.Snow(
      /** @type {!HTMLCanvasElement} */ (context.querySelector('.snow-canvas')),
      this.snowblower,
      this.fanStateManager);

  this.init_();
};

/**
 * Initializes the scene.
 *
 * @private
 */
app.Scene.prototype.init_ = function() {
  this.fan.init();
  this.fanStateManager.init();
  this.rudolf.init();
  this.snowblower.init();
  this.snow.init();
};

/**
 * Stops the scene.
 *
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.fan.destroy();
  this.fanStateManager.destroy();
  this.rudolf.destroy();
  this.snowblower.destroy();
  this.snow.destroy();
};
