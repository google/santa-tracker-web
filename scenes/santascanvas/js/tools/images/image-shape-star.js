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

goog.provide('app.ImageShapeStar');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Star shape
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageShapeStar = function($elem, name) {
  app.SVGImage.call(this);

  this.width = 78.8;
  this.height = 75;
};
app.ImageShapeStar.prototype = Object.create(app.SVGImage.prototype);


app.ImageShapeStar.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78.71 75" width="78.71" height="75"><defs><style>.cls-1{fill:' + color + ';}</style></defs><polygon class="cls-1" points="39.2 0 51.5 24.58 78.72 28.38 59.14 47.67 63.93 74.73 39.54 62.08 15.28 75 19.78 47.89 0 28.81 27.17 24.71 39.2 0"/></svg>';
  return data;
};
