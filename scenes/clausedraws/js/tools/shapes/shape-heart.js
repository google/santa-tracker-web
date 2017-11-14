/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.provide('app.ShapeHeart');
goog.require('app.Constants');
goog.require('app.Shape');


/**
 * Shape Circle tool
 * @constructor
 * @extends {app.Shape}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the shape
 */
app.ShapeHeart = function($elem, name) {
  app.Shape.call(this, $elem, name);

  this.width = 75.2;
  this.height = 65;
};
app.ShapeHeart.prototype = Object.create(app.Shape.prototype);


app.ShapeHeart.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.16 65"><defs><style>.cls-1{fill:' + colors.primary + ';}</style></defs><path class="cls-1" d="M55.89,0A19.48,19.48,0,0,0,37.58,11.46,19.48,19.48,0,0,0,19.27,0C-1.39,0,0,19,0,19,0,42.39,37.58,65,37.58,65S75.14,42.39,75.14,19C75.14,19,76.56,0,55.89,0Z"/></svg>';
  return data;
};
