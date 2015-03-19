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

goog.provide('app.HouseEyesMediator');

goog.require('app.Constants');

/**
 * Playground Scene class
 * Main class responsible for kicking off the scene
 * additional classes and elements.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 */
app.HouseEyesMediator = function(context) {
  this.onMouseMove_ = this.onMouseMove_.bind(this);

  this.$context_ = $(context);
  this.houses = {};

  this.$context_.on('mousemove', this.onMouseMove_);
};

/**
 * Destroys this mediator.
 */
app.HouseEyesMediator.prototype.destroy = function() {
  this.houses = {};
  this.$context_.off('mousemove', this.onMouseMove_);
};

/**
 * Subscribe to this mediator to be able to receive published messages.
 *
 * @param {string} key Unique key name representing the "name" of this house.
 * @param {!Object} house House instance.
 */
app.HouseEyesMediator.prototype.subscribe = function(key, house) {
  if (house) {
    this.houses[key] = house;
    house.eyesMediator = this;
  }
};

/**
 * Unsubscribe to this mediator to no longer receive published messages.
 *
 * @param {string} key Unique key name represending the "name" of this house.
 */
app.HouseEyesMediator.prototype.unsubscribe = function(key) {
  if (this.houses.hasOwnProperty(hey)) {
    delete this.houses[key];
  }
};

/**
 * Callback for when the mouse is moving.
 *
 * @param {!Event} event Event object.
 * @private
 */
app.HouseEyesMediator.prototype.onMouseMove_ = function(event) {
  var key = null;
  var mouse = {
    x: event.pageX,
    y: event.pageY
  };

  for (key in this.houses) {
    if (typeof this.houses[key].moveEyes === 'function') {
      this.houses[key].moveEyes(mouse);
    }
  }
};
