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

goog.provide('app.PenBells');
goog.require('app.Constants');
goog.require('app.ImageManager');
goog.require('app.PenGarland');
goog.require('app.utils');


/**
 * PenBells tool
 * @constructor
 * @extends {app.PenGarland}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.PenBells = function($elem, name, config) {
  app.PenGarland.call(this, $elem, name, config);
  this.lineColor = '#e43935';
  this.lineSize = 3;
  this.soundKey = name;
  this.disableColorpicker = true;
};
app.PenBells.prototype = Object.create(app.PenGarland.prototype);


app.PenBells.prototype.getOffsets = function(drawWidth, drawHeight) {
  return {
    x: drawWidth / 2,
    y: 0
  };
};
