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

goog.provide('app.ShapePentagon');
goog.require('app.Constants');
goog.require('app.Shape');


/**
 * Shape Circle tool
 * @constructor
 * @extends {app.Shape}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the shape
 */
app.ShapePentagon = function($elem, name) {
  app.Shape.call(this, $elem, name);

  this.width = 78.9;
  this.height = 75;
};
app.ShapePentagon.prototype = Object.create(app.Shape.prototype);


app.ShapePentagon.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78.86 75"><defs><style>.cls-1{fill:' + colors.primary + ';}</style></defs><polygon class="cls-1" points="39.43 0 0 28.65 15.06 75 63.8 75 78.86 28.65 39.43 0"/></svg>';
  return data;
};
