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

goog.provide('app.ImageItemCandyMintWheel');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy Mint Wheel image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyMintWheel = function() {
  app.SVGImage.call(this);

  this.width = 62.8;
  this.height = 62.8;
};
app.ImageItemCandyMintWheel.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyMintWheel.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.9 27.9" width="27.9" height="27.9"><defs><style>.cls-1{fill:#f2f2f2;}.cls-2{fill:' + color + ';}.cls-3{opacity:0.2;}</style></defs><circle class="cls-1" cx="13.95" cy="13.95" r="13.95"/><path class="cls-2" d="M27.42,10.35a14,14,0,0,0-6.49-8.47A13.94,13.94,0,0,0,14,14,13.94,13.94,0,0,1,27.42,10.35Z"/><path class="cls-2" d="M17.55,27.42A14,14,0,0,0,26,20.93,13.93,13.93,0,0,0,14,14,13.94,13.94,0,0,1,17.55,27.42Z"/><path class="cls-2" d="M.49,17.55A14,14,0,0,0,7,26,13.94,13.94,0,0,0,14,14,13.92,13.92,0,0,1,.49,17.55Z"/><path class="cls-2" d="M10.35.49A14,14,0,0,0,1.88,7,13.94,13.94,0,0,0,14,14,13.92,13.92,0,0,1,10.35.49Z"/><path class="cls-3" d="M22.6,3A14,14,0,0,1,3,22.6,14,14,0,1,0,22.6,3Z"/></svg>';
  return data;
};
