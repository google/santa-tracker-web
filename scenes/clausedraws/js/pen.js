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

goog.provide('app.Pen');
goog.require('app.Tool');


/**
 * Coloured spray tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 */
app.Pen = function($elem, name, color) {
  app.Tool.call(this, $elem, 'spray--' + name, {x: 47, y: 0});

  // This is a hidden image on the page that's used by the canvas
  this.spray = this.elem.find('#spray--' + name)[0];
  this.soundKey = 'selfie_color';
  this.color = color || name;
  this.lastCoord = null;
};
app.Pen.prototype = Object.create(app.Tool.prototype);

/**
 * [draw description]
 * @param  {[type]} context     [description]
 * @param  {[type]} mouseCoords [description]
 * @param  {[type]} scale       [description]
 * @return {[type]}             [description]
 */
app.Pen.prototype.draw = function(context, mouseCoords) {
  context.strokeStyle = this.color;

  if (this.lastCoord) {
    context.lineCap = "round";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(this.lastCoord.x, this.lastCoord.y);
    context.lineTo(mouseCoords.x, mouseCoords.y);
    context.stroke();

    // TODO: add bezier smoothing
  }

  this.lastCoord = {x: mouseCoords.x, y: mouseCoords.y};
};


app.Pen.prototype.reset = function() {
  this.lastCoord = null;
}


