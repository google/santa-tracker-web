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

goog.provide('app.ImageItemCandySprinkleRound');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy round sprinkle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandySprinkleRound = function() {
  app.SVGImage.call(this);

  this.width = 7.7;
  this.height = 7.7;
};
app.ImageItemCandySprinkleRound.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySprinkleRound.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.66 7.66" width="7.66" height="7.66"><defs><style>.cls-1{fill:' + color + ';}.cls-2{opacity:0.2;}</style></defs><circle class="cls-1" cx="3.83" cy="3.83" r="3.83"/><path class="cls-2" d="M6.17.82A3.86,3.86,0,0,1,6.68,2.7,3.83,3.83,0,0,1,2.85,6.53,3.78,3.78,0,0,1,.51,5.71,3.82,3.82,0,1,0,6.17.82Z"/></svg>';
  return data;
};
