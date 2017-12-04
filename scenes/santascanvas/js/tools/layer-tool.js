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

goog.provide('app.LayerTool');
goog.require('app.Tool');


/**
 * Pen tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 * @param {app.LayerTool.Layer} layer The layer this tool changes
 */
app.LayerTool = function($elem, name, layer) {
  app.Tool.call(this, $elem, 'scene-' + name);

  this.soundKey = 'cd_scene_' + name;
  this.image = $elem.find('#scene-' + name)[0];


  if (layer == app.LayerTool.Layer.BACKGROUND) {
    this.canvas = $elem.find('#back-canvas')[0];
    this.backup = $elem.find('#back-backup')[0];
  } else if (layer == app.LayerTool.Layer.FOREGROUND) {
    this.canvas = $elem.find('#fore-canvas')[0];
    this.backup = $elem.find('#fore-backup')[0];
  }
  this.context = this.canvas.getContext('2d');
  this.backupContext = this.backup.getContext('2d');
};
app.LayerTool.prototype = Object.create(app.Tool.prototype);


/**
 * Enum for canvas layers.
 * @enum {number}
 */
app.LayerTool.Layer = {
  BACKGROUND: 0,
  FOREGROUND: 1
};


/**
 * Draws this tool to the canvas.
 */
app.LayerTool.prototype.draw = function() {
  if (this.image) {
    var r = this.canvas.height / this.image.height;
    var w = this.image.width * r;
    var x = this.canvas.width/2 - w/2;
    this.context.drawImage(this.image, x, 0, w,
        this.canvas.height);

    var backupR = this.backup.height / this.image.height;
    var backupW = this.image.width * backupR;
    var backupX = this.backup.width/2 - backupW/2;
    this.backupContext.drawImage(this.image, backupX, 0, backupW,
        this.backup.height);

    window.santaApp.fire('sound-trigger', this.soundKey);
  } else {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  }
  return true;
};
