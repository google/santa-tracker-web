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

goog.provide('app.ImageItemConfettiCurve');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Confetti Curve image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemConfettiCurve = function() {
  app.SVGImage.call(this);

  this.width = 40.2;
  this.height = 42.34;
};
app.ImageItemConfettiCurve.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemConfettiCurve.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.2 42.34" width="40.2" height="42.34"><defs><style>.cls-1{fill:' + color + ';}</style></defs><path class="cls-1" d="M39.85,42.34c-13.69-.28-24.19-4.59-31.21-12.8C-2,17.16.13.69.23,0L17,2.28,8.62,1.14,17,2.22c0,.09-1.12,9.86,4.56,16.39,3.75,4.33,10,6.61,18.61,6.79Z"/></svg>';
  return data;
};
