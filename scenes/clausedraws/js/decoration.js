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

goog.provide('app.Decoration');
goog.require('app.Tool');


/**
 * Decorations that stick on the beard
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the decoration
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {!Image} decoration image.
 */
app.Decoration = function($elem, name, offset, decoration) {
  app.Tool.call(this, $elem, 'decoration--' + name, offset);

  this.decoration = decoration;
};
app.Decoration.prototype = Object.create(app.Tool.prototype);

/**
 * [draw description]
 * @param  {[type]} context     [description]
 * @param  {[type]} mouseCoords [description]
 * @param  {[type]} scale       [description]
 * @return {[type]}             [description]
 */
app.Decoration.prototype.draw = function(context, mouseCoords, scale) {
  var drawWidth = this.decoration.width * scale;
  var drawHeight = this.decoration.height * scale;
  context.drawImage(this.decoration,
    mouseCoords.x - drawWidth / 2, mouseCoords.y - drawHeight / 2,
    drawWidth, drawHeight);
};
