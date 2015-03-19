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

goog.require('app.Constants');
goog.require('app.House');
goog.require('app.HouseColorMediator');
goog.require('app.HouseEyesMediator');

/**
 * Playground Scene class
 * Main class responsible for kicking off the scene plus its additional classes
 * and elements.
 *
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];

  this.houses = [];
  this.$houses = this.$context_.find(app.Constants.HOUSE_CSS_SELECTOR);

  // Go!
  this.init_();
};

/**
 * Initializes the Scene by binding some events.
 * @private
 */
app.Scene.prototype.init_ = function() {
  var i = 0;
  var house = null;
  var $house = null;

  this.colorMediator = new app.HouseColorMediator();
  this.eyesMediator = new app.HouseEyesMediator(this.$context_);

  this.numHouses = this.$houses.length;

  for (i = 0; i < this.numHouses; i++) {
    $house = this.$houses.eq(i);
    house = new app.House($house);
    this.houses.push(house);
    this.colorMediator.subscribe('house' + i, house);
    this.eyesMediator.subscribe('house' + i, house);
  }
};

/**
 * Stops the playground scene.
 * @export
 */
app.Scene.prototype.destroy = function() {
  var i = 0;

  this.colorMediator.destroy();
  this.eyesMediator.destroy();

  for (i = 0; i < this.numHouses; i++) {
    this.houses[i].destroy();
  }
};
