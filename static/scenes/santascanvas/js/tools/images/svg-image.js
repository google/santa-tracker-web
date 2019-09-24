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

goog.provide('app.SVGImage');
goog.require('app.Constants');
goog.require('app.utils');


/**
 * @constructor
 */
app.SVGImage = function() {
  this.cache = {};
  this.width = 100;
  this.height = 100;
};


app.SVGImage.prototype.getSVGString = function(color) {
  // subclasses fill this out
  return;
};


app.SVGImage.prototype.getImage = function(color, callback) {
  if (!this.cache[color]) {
    this.cache[color] = app.utils.svgToImage(this.getSVGString(color), callback);
  }

  return this.cache[color];
};
