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
 'use strict';

goog.provide('app.ChooseMap');

goog.require('app.shared.Overlay');
goog.require('app.shared.utils');

/**
 * Choose map overlay.
 * @param {!jQuery} elem The gameover element.
 * @constructor
 * @struct
 */
app.ChooseMap = function(elem) {
  this.elem = elem;

  this.elem.on('click', '.choose-map__option', this.setMap_.bind(this));

  this.overlay = new app.shared.Overlay(this.elem[0]);
};

/**
 * Set the map when the user chooses.
 */
app.ChooseMap.prototype.setMap_ = function(event) {
  let mapName = $(event.currentTarget).data('map');
  this.callback(mapName);
  this.overlay.hide();
};

/**
 * Shows the share screen with an animation.
 * @param {function()=} callback Runs when a map is selected.
 */
app.ChooseMap.prototype.show = function(callback) {
  this.callback = callback;
  this.overlay.show();
};
