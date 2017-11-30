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

goog.provide('app.ImageShapeTriangle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Triangle shape
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageShapeTriangle = function($elem, name) {
  app.SVGImage.call(this);

  this.width = 75.1;
  this.height = 65;
};
app.ImageShapeTriangle.prototype = Object.create(app.SVGImage.prototype);


app.ImageShapeTriangle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.06 65" width="75.06" height="65"><defs><style>.cls-1{fill:' + color + ';}</style></defs><polygon class="cls-1" points="37.53 0 0 65 75.06 65 37.53 0"/></svg>';
  return data;
};
