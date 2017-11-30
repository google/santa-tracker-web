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

goog.provide('app.ImageItemCandyJellybean');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy jellybean image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyJellybean = function() {
  app.SVGImage.call(this);

  this.width = 53.2;
  this.height = 28;
};
app.ImageItemCandyJellybean.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyJellybean.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.62 13.95" width="26.62" height="13.95"><defs><style>.cls-1{fill:' + color + ';}.cls-2{fill:none;stroke:#f2f2f2;stroke-linecap:round;stroke-miterlimit:10;stroke-width:1.69px;opacity:0.3;}</style></defs><path class="cls-1" d="M13.31,14C9.83,14,0,13.11,0,5.71H0A6.11,6.11,0,0,1,.71,2.83,5,5,0,0,1,6.37.31a33.28,33.28,0,0,0,6.94,1.17C17.42,1.48,19.86,0,21.62,0c2.78,0,5,2.62,5,5.71h0C26.62,13.11,16.79,14,13.31,14Z"/><path class="cls-2" d="M3.66,8.33A20.65,20.65,0,0,0,14,10.87c6.34,0,9.52-2.54,9.52-2.54"/></svg>';
  return data;
};
