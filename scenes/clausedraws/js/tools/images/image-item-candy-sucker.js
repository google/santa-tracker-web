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

  this.width = 27.3;
  this.height = 67.1;
};
app.ImageItemCandySucker.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySucker.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44.57 59.61"><defs><style>.cls-1{fill:' + colors.primary + ';}.cls-2{fill:' + colors.dark + ';}.cls-3{fill:#fff;}.cls-4{fill:#231f20;opacity:0.1;}.cls-5{fill:#607d8b;}.cls-6{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M25.87,15.63V11.3H18.26v4.35a22.18,22.18,0,1,0,7.61,0Z"/><circle class="cls-2" cx="9.84" cy="27.39" r="1.41"/><circle class="cls-3" cx="16.73" cy="35.71" r="1.41"/><circle class="cls-2" cx="27.56" cy="35.72" r="1.41"/><circle class="cls-1" cx="20.27" cy="28.75" r="1.41"/><circle class="cls-3" cx="29.69" cy="20.85" r="1.41"/><circle class="cls-3" cx="30.38" cy="43.3" r="1.41"/><circle class="cls-3" cx="31.78" cy="30.15" r="1.41"/><circle class="cls-3" cx="18.34" cy="19.82" r="1.41"/><circle class="cls-2" cx="31.1" cy="52.04" r="1.41"/><circle class="cls-2" cx="14.06" cy="44.71" r="1.41"/><circle class="cls-1" cx="39.63" cy="39.94" r="1.41"/><circle class="cls-3" cx="8.43" cy="49.53" r="1.41"/><circle class="cls-1" cx="5.02" cy="35.71" r="1.41"/><circle class="cls-1" cx="20.27" cy="41.6" r="1.41"/><circle class="cls-1" cx="20.95" cy="54.85" r="1.41"/><path class="cls-4" d="M38,21.74a22,22,0,0,0-12.15-6.15V11.3h-3.8v4a24.38,24.38,0,0,1,.17,44.29A22.15,22.15,0,0,0,38,21.74Z"/><path class="cls-5" d="M17.87,8.73a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0l1.32,1.32a.11.11,0,0,0,.15,0L25,13.18a.1.1,0,0,1,.14,0l1.22,1.22a.1.1,0,0,0,.17-.07V8.83a.1.1,0,0,0-.1-.1Z"/><path class="cls-6" d="M22.41,12.25V2.45A1.92,1.92,0,0,0,20.48.52h0a1.93,1.93,0,0,0-1.93,1.93V5.24"/></svg>';
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.27 67.14"><defs><style>.cls-1{fill:#f2f2f2;}.cls-2{fill:' + colors.dark + ';}.cls-3{fill:none;stroke:' + colors.medium + ';stroke-linecap:round;stroke-miterlimit:10;stroke-width:1.04px;}.cls-4{fill:' + colors.primary + ';}.cls-5{opacity:0.2;}</style></defs><rect class="cls-1" x="12.12" y="6.22" width="3.04" height="60.92"/><path class="cls-2" d="M11.8,26.77a21.86,21.86,0,0,0-4.49,3.64C6.06,31.68,4.9,33.1,4.74,34.68a2.09,2.09,0,0,0,.9,2.09,1.67,1.67,0,0,0,1.12.28,2.06,2.06,0,0,0,.86-.35,6.92,6.92,0,0,0,1.08-.84A2.19,2.19,0,0,1,10,35.08a1.69,1.69,0,0,1,1.3.56c.31.32,1,1.55,2.32,1.55s2-1.23,2.31-1.55a1.69,1.69,0,0,1,1.3-.56,2.24,2.24,0,0,1,1.33.78,6.84,6.84,0,0,0,1.07.84,2.06,2.06,0,0,0,.86.35,1.7,1.7,0,0,0,1.13-.28,2.11,2.11,0,0,0,.9-2.09c-.17-1.58-1.32-3-2.57-4.27a22.19,22.19,0,0,0-4.5-3.64Z"/><path class="cls-3" d="M15.15,28.73a27.11,27.11,0,0,1,2,4.62"/><path class="cls-3" d="M12.12,28.73a27.93,27.93,0,0,0-2,4.62"/><circle class="cls-4" cx="13.64" cy="13.64" r="13.64"/><path class="cls-5" d="M24.13,4.92a13.79,13.79,0,0,1,.19,7.77A16.8,16.8,0,0,1,17,22.26,22.47,22.47,0,0,1,6.89,25.49,13.64,13.64,0,0,0,24.13,4.92Z"/></svg>';
  return data;
};
