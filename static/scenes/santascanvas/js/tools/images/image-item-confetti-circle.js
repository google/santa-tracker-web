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

goog.provide('app.ImageItemConfettiCircle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Confetti Circle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemConfettiCircle = function() {
  app.SVGImage.call(this);

  this.width = 19.7;
  this.height = 19.7;
};
app.ImageItemConfettiCircle.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemConfettiCircle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.73 19.73" width="19.73" height="19.73"><defs><style>.cls-1{fill:' + color + ';}</style></defs><circle class="cls-1" cx="9.86" cy="9.86" r="9.86"/></svg>';
  return data;
};
