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

goog.provide('app.ImageItemCandyWrapper1');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy Wrapper 1 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyWrapper1 = function() {
  app.SVGImage.call(this);

  this.width = 100.83;
  this.height = 41.8;
};
app.ImageItemCandyWrapper1.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyWrapper1.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67.22 27.87" width="67.22" height="27.87"><defs><style>.cls-1{fill:' + colors.dark + ';}.cls-2{fill:none;stroke:' + colors.medium + ';stroke-linecap:round;stroke-miterlimit:10;stroke-width:1.06px;}.cls-3{fill:' + colors.primary + ';}.cls-4{opacity:0.2;}</style></defs><path class="cls-1" d="M46.07,16.71a37.83,37.83,0,0,0,7.38,6.8c2.59,1.9,5.47,3.65,8.67,3.9A5,5,0,0,0,66.37,26a2.16,2.16,0,0,0,.57-1.7,2.8,2.8,0,0,0-.72-1.3,11.92,11.92,0,0,0-1.7-1.63c-.69-.55-1.51-1.13-1.6-2a2.35,2.35,0,0,1,1.15-2c.64-.47,3.15-1.53,3.15-3.51s-2.51-3-3.15-3.5a2.36,2.36,0,0,1-1.15-2c.09-.88.91-1.46,1.6-2a12,12,0,0,0,1.7-1.64,2.81,2.81,0,0,0,.72-1.29,2.19,2.19,0,0,0-.57-1.71A5,5,0,0,0,62.12.46c-3.2.25-6.08,2-8.67,3.89a38.14,38.14,0,0,0-7.38,6.8Z"/><path class="cls-1" d="M21.15,16.71a37.83,37.83,0,0,1-7.38,6.8c-2.6,1.9-5.47,3.65-8.67,3.9A5,5,0,0,1,.85,26a2.13,2.13,0,0,1-.57-1.7A2.71,2.71,0,0,1,1,23a12.39,12.39,0,0,1,1.69-1.63c.69-.55,1.51-1.13,1.6-2a2.34,2.34,0,0,0-1.14-2C2.51,17,0,15.91,0,13.93s2.51-3,3.15-3.5a2.35,2.35,0,0,0,1.14-2c-.09-.88-.91-1.46-1.6-2A12.47,12.47,0,0,1,1,4.82,2.73,2.73,0,0,1,.28,3.53,2.15,2.15,0,0,1,.85,1.82,5,5,0,0,1,5.1.46c3.2.25,6.07,2,8.67,3.89a38.14,38.14,0,0,1,7.38,6.8Z"/><path class="cls-2" d="M50.47,11.64a80.27,80.27,0,0,1,10.4-3"/><path class="cls-2" d="M50.47,16.23a80.27,80.27,0,0,0,10.4,3"/><path class="cls-2" d="M16.74,11.64a80.12,80.12,0,0,0-10.39-3"/><path class="cls-2" d="M16.74,16.23a80.12,80.12,0,0,1-10.39,3"/><circle class="cls-3" cx="33.61" cy="13.93" r="13.93"/><path class="cls-4" d="M44.33,5A14.08,14.08,0,0,1,44.52,13a17.07,17.07,0,0,1-7.47,9.78,23,23,0,0,1-10.33,3.31A13.94,13.94,0,0,0,44.33,5Z"/></svg>';
  return data;
};
