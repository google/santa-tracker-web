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

goog.provide('app.ImageItemConfettiOutlinedCircle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Confetti Outlined Circle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemConfettiOutlinedCircle = function() {
  app.SVGImage.call(this);

  this.width = 25.51;
  this.height = 25.51;
};
app.ImageItemConfettiOutlinedCircle.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemConfettiOutlinedCircle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.51 25.51" width="25.51" height="25.51"><defs><style>.cls-1{fill:' + color + ';}</style></defs><path class="cls-1" d="M12.75,25.51A12.76,12.76,0,1,1,25.51,12.76,12.76,12.76,0,0,1,12.75,25.51Zm0-19.73a7,7,0,1,0,7,7A7,7,0,0,0,12.75,5.78Z"/></svg>';
  return data;
};
