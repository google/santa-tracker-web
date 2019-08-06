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

goog.provide('app.ImageItemStringLight');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * String Light image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemStringLight = function() {
  app.SVGImage.call(this);

  this.width = 77.3
  this.height = 81;
};
app.ImageItemStringLight.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemStringLight.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 77.3 80.97" width="77.3" height="80.97"><defs><style>.cls-1{fill:#333;}.cls-2{fill:#212121;}.cls-3{fill:url(#radial-gradient);}.cls-4{fill:' + colors.primary + ';}.cls-5{fill:' + colors.highlight + ';stroke:' + colors.highlight + ';stroke-linejoin:round;stroke-width:1.8px;}</style><radialGradient id="radial-gradient" cx="234.84" cy="50" r="50" gradientTransform="translate(-189.13) scale(1.02 1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + colors.highlight + '"/><stop offset="1" stop-color="' + colors.highlight + '" stop-opacity="0"/></radialGradient><symbol id="New_Symbol_17" data-name="New Symbol 17" viewBox="0 0 102.32 107.18"><path class="cls-1" d="M42.05,77.24H60.27a4.08,4.08,0,0,1,4.08,4.08V103.1a4.08,4.08,0,0,1-4.08,4.08H42.05A4.08,4.08,0,0,1,38,103.1V81.32A4.08,4.08,0,0,1,42.05,77.24Z"/><polygon class="cls-2" points="37.97 97.05 64.35 97.05 64.35 102.32 37.97 102.32 37.97 97.05"/><polygon class="cls-2" points="37.97 83.24 64.35 83.24 64.35 93.13 37.97 93.13 37.97 83.24"/><ellipse class="cls-3" cx="51.16" cy="50" rx="51.16" ry="50"/><path class="cls-4" d="M26.56,65.89c0-13.59,11-41.9,24.6-41.9s24.6,28.31,24.6,41.9a24.6,24.6,0,0,1-49.2,0Z"/><path class="cls-5" d="M53.15,82.12c-10.81,0-19.58-9.45-19.58-21.11,0-4.32,1.21-10.36,3.27-16.27-3.51,7-5.72,15.68-5.72,21.21,0,10.45,7.86,18.93,17.56,18.93a16.69,16.69,0,0,0,10.54-3.8A18.3,18.3,0,0,1,53.15,82.12Z"/></symbol></defs><use width="102.32" height="107.18" transform="scale(0.76)" xlink:href="#New_Symbol_17"/></svg>';
  return data;
};

