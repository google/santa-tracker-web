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

goog.provide('app.EffectInvert');
goog.require('app.Tool');


/**
 * Effect tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 * @param {app.EffectInvert.Layer} layer The layer this tool changes
 */
app.EffectInvert = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';
  this.bgCanvas = $elem.find('#back-canvas')[0];
  this.bgBackup = $elem.find('#back-backup')[0];
  this.bgContext = this.bgCanvas.getContext('2d');
  this.bgBackupContext = this.bgBackup.getContext('2d');
};
app.EffectInvert.prototype = Object.create(app.Tool.prototype);


/**
 * Applies the filter to canvas.
 */
app.EffectInvert.prototype.draw = function(canvas) {
  var context = canvas.getContext('2d');
  var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  imgData = this.invertColors(imgData);
  context.putImageData(imgData, 0, 0);

  // apply filter to background canvas
  var bgImgData = this.bgContext.getImageData(0, 0, this.bgCanvas.width, this.bgCanvas.height);
  bgImgData = this.invertColors(bgImgData);
  this.bgContext.putImageData(bgImgData, 0, 0);
  this.bgBackupContext.putImageData(bgImgData, 0, 0);

  return true;
};


/**
 * Inverts RGB values
 */
app.EffectInvert.prototype.invertColors = function(imageData) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i+= 4) {
    data[i] = 255 - data[i]; // r
    data[i + 1] = 255 - data[i + 1]; // g
    data[i + 2] = 255 - data[i + 2]; // b
  }

  return imageData;
};
