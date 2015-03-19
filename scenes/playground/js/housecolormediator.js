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

goog.provide('app.HouseColorMediator');

goog.require('app.Constants');

/**
 * House color mediator. Manages the colors of all houses in the scene.
 *
 * @constructor
 */
app.HouseColorMediator = function() {
  this.houses = {};
};

/**
 * Stops the mediator and clears its subscribers.
 */
app.HouseColorMediator.prototype.destroy = function() {
  this.houses = {};
};

/**
 * Subscribe to this mediator to be able to receive published messages.
 *
 * @param {string} key Unique key name representing the "name" of this house.
 * @param {!Object} house House instance.
 */
app.HouseColorMediator.prototype.subscribe = function(key, house) {
  if (house) {
    this.houses[key] = house;
    house.colorMediator = this;
  }
};

/**
 * Unsubscribe to this mediator to no longer receive published messages.
 *
 * @param {string} key Unique key name represending the "name" of this house.
 */
app.HouseColorMediator.prototype.unsubscribe = function(key) {
  if (this.houses.hasOwnProperty(hey)) {
    delete this.houses[key];
  }
};

/**
 * Broadcasts a message to all objects subscribed to this mediator.
 *
 * @param {string} color The color that it needs to change to.
 * @param {Object} from The subject that is broadcasting this.
 */
app.HouseColorMediator.prototype.publish = function(color, from) {
  var key = null;
  for (key in this.houses) {
    if (typeof this.houses[key].changeColor === 'function') {
      this.houses[key].changeColor(color, from);
    }
  }
};
