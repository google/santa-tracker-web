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

goog.provide('app.ImageItemOrnamentRound3');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Round ornament 3 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentRound3 = function() {
  app.SVGImage.call(this);

  this.width = 44.5;
  this.height = 59.6;
};
app.ImageItemOrnamentRound3.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentRound3.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44.57 59.61" width="44.57" height="59.61"><defs><style>.cls-1{fill:' + colors.primary + ';}.cls-2{fill:' + colors.dark + ';}.cls-3{fill:#fff;}.cls-4{fill:#231f20;opacity:0.1;}.cls-5{fill:#607d8b;}.cls-6{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M25.87,15.63V11.3H18.26v4.35a22.18,22.18,0,1,0,7.61,0Z"/><circle class="cls-2" cx="9.84" cy="27.39" r="1.41"/><circle class="cls-3" cx="16.73" cy="35.71" r="1.41"/><circle class="cls-2" cx="27.56" cy="35.72" r="1.41"/><circle class="cls-1" cx="20.27" cy="28.75" r="1.41"/><circle class="cls-3" cx="29.69" cy="20.85" r="1.41"/><circle class="cls-3" cx="30.38" cy="43.3" r="1.41"/><circle class="cls-3" cx="31.78" cy="30.15" r="1.41"/><circle class="cls-3" cx="18.34" cy="19.82" r="1.41"/><circle class="cls-2" cx="31.1" cy="52.04" r="1.41"/><circle class="cls-2" cx="14.06" cy="44.71" r="1.41"/><circle class="cls-1" cx="39.63" cy="39.94" r="1.41"/><circle class="cls-3" cx="8.43" cy="49.53" r="1.41"/><circle class="cls-1" cx="5.02" cy="35.71" r="1.41"/><circle class="cls-1" cx="20.27" cy="41.6" r="1.41"/><circle class="cls-1" cx="20.95" cy="54.85" r="1.41"/><path class="cls-4" d="M38,21.74a22,22,0,0,0-12.15-6.15V11.3h-3.8v4a24.38,24.38,0,0,1,.17,44.29A22.15,22.15,0,0,0,38,21.74Z"/><path class="cls-5" d="M17.87,8.73a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0l1.32,1.32a.11.11,0,0,0,.15,0L25,13.18a.1.1,0,0,1,.14,0l1.22,1.22a.1.1,0,0,0,.17-.07V8.83a.1.1,0,0,0-.1-.1Z"/><path class="cls-6" d="M22.41,12.25V2.45A1.92,1.92,0,0,0,20.48.52h0a1.93,1.93,0,0,0-1.93,1.93V5.24"/></svg>';
  return data;
};
