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

goog.provide('app.ImageItemConfettiSquiggle');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Confetti Squiggle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemConfettiSquiggle = function() {
  app.SVGImage.call(this);

  this.width = 35.9;
  this.height = 58.88;
};
app.ImageItemConfettiSquiggle.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemConfettiSquiggle.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.91 58.88" width="35.91" height="58.88"><defs><style>.cls-1{fill:' + color + ';}</style></defs><path class="cls-1" d="M29.71,58.88a4.8,4.8,0,0,1-4-2.12c-2.93-4.35-1.16-8.64-.1-11.21a9.38,9.38,0,0,0,.79-2.37c-.28,0-1.56,0-2.41,0-2.79,0-7.42,0-10.35-4.31s-1.15-8.64-.09-11.21a9.25,9.25,0,0,0,.79-2.37c-.28,0-1.56,0-2.41,0-2.76,0-7.42.05-10.35-4.3S.45,12.27,1.51,9.71A9.3,9.3,0,0,0,2.3,7.33,4.69,4.69,0,0,1,3.6.8a4.76,4.76,0,0,1,6.59,1.32c2.92,4.35,1.15,8.65.09,11.21a9.82,9.82,0,0,0-.8,2.38c.28,0,1.56,0,2.41,0,2.77,0,7.43-.05,10.35,4.3s1.16,8.64.09,11.21a10.12,10.12,0,0,0-.79,2.37c.28.05,1.57,0,2.41,0,2.77,0,7.43,0,10.36,4.3s1.15,8.65.09,11.21a9.3,9.3,0,0,0-.79,2.38,4.69,4.69,0,0,1-1.3,6.54A4.61,4.61,0,0,1,29.71,58.88Z"/></svg>';
  return data;
};
