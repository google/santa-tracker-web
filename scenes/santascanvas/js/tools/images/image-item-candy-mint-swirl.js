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

goog.provide('app.ImageItemCandyMintSwirl');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy Mint Swirl image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyMintSwirl = function() {
  app.SVGImage.call(this);

  this.width = 63.6;
  this.height = 62.9;
};
app.ImageItemCandyMintSwirl.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyMintSwirl.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28.25 27.9" width="28.25" height="27.9"><defs><style>.cls-2{fill:#f2faff;}.cls-4{fill:' + colors.highlight + ';}.cls-5{opacity:0.2;}</style></defs><circle class="cls-2" cx="14.3" cy="13.95" r="13.95"/><g class="cls-3"><path class="cls-4" d="M1,19.42A12.63,12.63,0,0,1,2,7.77,14.52,14.52,0,0,1,6.6,3.22a8.69,8.69,0,0,1,1.47-.8,10.92,10.92,0,0,1,1.56-.6,12.7,12.7,0,0,1,3.46-.65,13.09,13.09,0,0,1,12.08,7,12.35,12.35,0,0,1,1.26,3.54,11.25,11.25,0,0,1,.09,4,11.81,11.81,0,0,1-3.75,7,11.84,11.84,0,0,1-3.45,2.09,12.21,12.21,0,0,1-1.93.58,11.22,11.22,0,0,1-2.16.21A10,10,0,0,1,7.64,22a9.87,9.87,0,0,1-1.92-3.79,8.47,8.47,0,0,1,0-4.47A8.32,8.32,0,0,1,7.94,9.85a8.23,8.23,0,0,1,3.87-2,7,7,0,0,1,4.56.44,6.56,6.56,0,0,1,3.82,5.25A5.71,5.71,0,0,1,20,15.82a5.38,5.38,0,0,1-2.92,3.31,5.22,5.22,0,0,1-2.17.42,4.43,4.43,0,0,1-2.15-.67,4,4,0,0,1-1.86-3.64,3.07,3.07,0,0,1,2.57-2.76,2.24,2.24,0,0,1,1.77.49A1.94,1.94,0,0,1,16,14.42v0a.21.21,0,0,1-.42,0,1.48,1.48,0,0,0-1.84-1.09,1.91,1.91,0,0,0-1.38,1.82,2.37,2.37,0,0,0,1.28,2A2.51,2.51,0,0,0,16,17.15a3.05,3.05,0,0,0,1.5-1.94,3.38,3.38,0,0,0-.4-2.44,3.85,3.85,0,0,0-1.9-1.64A3.73,3.73,0,0,0,12.7,11a4.78,4.78,0,0,0-3.39,3.54,5.59,5.59,0,0,0,1.34,4.79,6.15,6.15,0,0,0,4.58,2.07A7.45,7.45,0,0,0,20,19.51,7.7,7.7,0,0,0,22.43,15a8.32,8.32,0,0,0-.85-5.1,9.71,9.71,0,0,0-8.53-5.41A12.05,12.05,0,0,0,3.77,9.15,12.4,12.4,0,0,0,1.4,19.33a.2.2,0,0,1-.16.25A.21.21,0,0,1,1,19.47Z"/></g><path class="cls-5" d="M23,3.12a13.88,13.88,0,0,1-19.5,19.5A13.88,13.88,0,1,0,23,3.12Z"/></svg>';
  return data;
};
