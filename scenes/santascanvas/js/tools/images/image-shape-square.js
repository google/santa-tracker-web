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

goog.provide('app.ImageShapeSquare');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Square shape
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageShapeSquare = function($elem, name) {
  app.SVGImage.call(this);

  this.width = 65;
  this.height = 65;
};
app.ImageShapeSquare.prototype = Object.create(app.SVGImage.prototype);


app.ImageShapeSquare.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65" width="65" height="65"><defs><style>.cls-1{fill:' + color + ';}</style></defs><rect class="cls-1" width="65" height="65"/></svg>';
  return data;
};
