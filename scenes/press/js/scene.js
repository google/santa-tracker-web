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

goog.require('app.Models');

/**
 * Press Scene class
 * Main class responsible for kicking off the scene's additional classes and
 * elements.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.context = $(context);

  this.active = '';
  this.$filters = this.context.find('#press-card-tabs button');

  this.init_();
};

/**
 * Return cards models.
 * @return {!Array.<object>} array of model objects to fill cards
 */

app.Scene.prototype.getCards = function() {
  return Cards;
}

/**
 * Initializes the Scene by biding some events
 *
 * @private
 */

app.Scene.prototype.init_ = function() {
  this.$filters.on('click', this.onFilterSelect_.bind(this));
}

/**
 * Event to select filter for scenes.
 *
 * @private
 */

app.Scene.prototype.onFilterSelect_ = function() {
  console.log('selected filter');
  this.active = 'new';
};