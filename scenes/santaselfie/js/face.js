/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.Face');

goog.require('app.utils');



/**
 * Interactions for Santa's face
 * @constructor
 * @extends {app.GameObject}
 * @param {!app.Game} game
 * @param {!jQuery} $elem The container element
 */
app.Face = function(game, $elem) {
  this.game_ = game;
  this.eyes = $elem.find('.eye');
  this.eyebrows = $elem.find('.eyebrow');
  this.nose = $elem.find('.nose');
  this.face = $elem.find('.Face');
};


/**
 * @extends {app.GameObject.start}
 */
app.Face.prototype.start = function() {
  function blink() {
    this.eyes.each(function(index, eye) {
      $(eye).addClass('eye--blink');

      window.setTimeout(function() {
        $(eye).removeClass('eye--blink');
      }, 200);
    }, this);
  }

  app.utils.randomLoop(blink.bind(this), 1000, 8000);
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {!app.Mouse} mouse
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Face.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (mouse !== this.game_.mouse) {
    throw new Error('unexpected mouse callback');
  }

  function transform(element, x, y) {
    element.css({
      'transform': 'translate3d(' + x + 'em, ' + y + 'em, 0)'
    });
  }

  function nearNose(distance) {
    var rect = this.nose[0].getBoundingClientRect();

    var centerX = (rect.left + rect.right) / 2;
    var centerY = (rect.top + rect.bottom) / 2;
    var differenceX = mouseCoords.x - centerX;
    var differenceY = mouseCoords.y - 86 - centerY;

    return Math.sqrt(differenceX * differenceX + differenceY * differenceY) < distance;
  }

  var EYE_MOVEMENT_X = 10;
  var EYE_MOVEMENT_Y = 5;

  transform(this.eyes, mouseCoords.relX * EYE_MOVEMENT_X, mouseCoords.relY * EYE_MOVEMENT_Y);
  transform(this.eyebrows, 0, mouse.relY * EYE_MOVEMENT_Y);
  transform(this.face, mouseCoords.relX * EYE_MOVEMENT_X, mouseCoords.relY * EYE_MOVEMENT_Y);

  var tools = this.game_.tools;

  this.face.toggleClass('Face--hairdryerLeft',
      tools.hairdryer.isSelected && mouseCoords.down && mouseCoords.relX < -0.3);
  this.face.toggleClass('Face--hairdryerRight',
      tools.hairdryer.isSelected && mouseCoords.down && mouseCoords.relX > 0.3);
  this.face.toggleClass('Face--hairdryerCenter',
      tools.hairdryer.isSelected && mouseCoords.down && Math.abs(mouseCoords.relX) < 0.3);
  this.face.toggleClass('Face--alarmed',
      tools.clipper.isSelected);
  this.face.toggleClass('Face--shaving',
      tools.clipper.isSelected && mouseCoords.down && nearNose.call(this, 120));
};
