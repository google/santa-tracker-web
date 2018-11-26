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

goog.provide('app.ImageItemConfettiTriangle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Confetti Triangle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemConfettiTriangle = function() {
  app.SVGImage.call(this);

  this.width = 30.2;
  this.height = 30.2;
};
app.ImageItemConfettiTriangle.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemConfettiTriangle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.24 30.24" width="30.24" height="30.24"><defs><style>.cls-1{fill:' + color + ';}</style></defs><polygon class="cls-1" points="30.24 30.24 22.14 0 0 22.14 30.24 30.24"/></svg>';
  return data;
};
