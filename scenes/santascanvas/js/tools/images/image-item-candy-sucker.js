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

goog.provide('app.ImageItemCandySucker');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy Sucker image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandySucker = function() {
  app.SVGImage.call(this);

  this.width = 40.9;
  this.height = 100.7;
};
app.ImageItemCandySucker.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySucker.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.27 67.14" width="27.27" height="67.14"><defs><style>.cls-1{fill:#f2f2f2;}.cls-2{fill:' + colors.dark + ';}.cls-3{fill:none;stroke:' + colors.medium + ';stroke-linecap:round;stroke-miterlimit:10;stroke-width:1.04px;}.cls-4{fill:' + colors.primary + ';}.cls-5{opacity:0.2;}</style></defs><rect class="cls-1" x="12.12" y="6.22" width="3.04" height="60.92"/><path class="cls-2" d="M11.8,26.77a21.86,21.86,0,0,0-4.49,3.64C6.06,31.68,4.9,33.1,4.74,34.68a2.09,2.09,0,0,0,.9,2.09,1.67,1.67,0,0,0,1.12.28,2.06,2.06,0,0,0,.86-.35,6.92,6.92,0,0,0,1.08-.84A2.19,2.19,0,0,1,10,35.08a1.69,1.69,0,0,1,1.3.56c.31.32,1,1.55,2.32,1.55s2-1.23,2.31-1.55a1.69,1.69,0,0,1,1.3-.56,2.24,2.24,0,0,1,1.33.78,6.84,6.84,0,0,0,1.07.84,2.06,2.06,0,0,0,.86.35,1.7,1.7,0,0,0,1.13-.28,2.11,2.11,0,0,0,.9-2.09c-.17-1.58-1.32-3-2.57-4.27a22.19,22.19,0,0,0-4.5-3.64Z"/><path class="cls-3" d="M15.15,28.73a27.11,27.11,0,0,1,2,4.62"/><path class="cls-3" d="M12.12,28.73a27.93,27.93,0,0,0-2,4.62"/><circle class="cls-4" cx="13.64" cy="13.64" r="13.64"/><path class="cls-5" d="M24.13,4.92a13.79,13.79,0,0,1,.19,7.77A16.8,16.8,0,0,1,17,22.26,22.47,22.47,0,0,1,6.89,25.49,13.64,13.64,0,0,0,24.13,4.92Z"/></svg>';
  return data;
};
