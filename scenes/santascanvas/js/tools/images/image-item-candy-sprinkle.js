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

goog.provide('app.ImageItemCandySprinkle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy sprinkle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandySprinkle = function() {
  app.SVGImage.call(this);

  this.width = 14;
  this.height = 12.6;
};
app.ImageItemCandySprinkle.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySprinkle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.06 6.3" width="7.06" height="6.3"><defs><style>.cls-1{fill:none;stroke:' + color + ';stroke-linecap:round;stroke-miterlimit:10;stroke-width:2.1px;}</style></defs><line class="cls-1" x1="1.05" y1="1.05" x2="6.02" y2="5.26"/></svg>';
  return data;
};
