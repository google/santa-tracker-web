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

goog.provide('app.Tool');
goog.require('app.shared.utils');


/**
 * Base tool item
 * @constructor
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 * Element should have class Tool-name.
 * @param {{x: number, y: number}} mouseOffset Tool offset relative to the mouse
 */
app.Tool = function($elem, name, mouseOffset) {
  this.elem = $elem;
  this.el = this.elem.find('.Tool-' + name);
  this.container = this.el.closest('.Tool-container');
  this.isSelected = false;
  this.mouseOffset = mouseOffset || {x: 0, y: 0};
  this.animationEl = null;
  this.animateInfinitely = false;
  this.animationPlayer = null;
  this.isAnimating = false;

  this.initAnimation_();
};


/**
 * Select this tool from the toolbox
 * @param {!app.Mouse.CoordsType} mouseCoords at selection time
 */
app.Tool.prototype.select = function(mouseCoords) {
  this.isSelected = true;

  this.el.addClass('Tool--selected');
  this.width = this.el.width();

  if (app.shared.utils.touchEnabled) {
    this.elem.css({ 'background-size': 0 }); // Hide tool on touch devices
  } else {
    this.elem.css({ cursor: 'none' });
  }

  this.move(mouseCoords);
  window.santaApp.fire('sound-trigger', 'selfie_click');
};


/**
 * Deselect this tool
 */
app.Tool.prototype.deselect = function() {
  this.isSelected = false;

  this.el.removeClass('Tool--selected Tool--left Tool--right Tool-hairdryer--center');
  this.el.css({
    top: '',
    left: ''
  });
  this.elem.css({
    cursor: ''
  });
};


/**
 * @private
 * @return {boolean} whether this tool orients both left and right
 */
app.Tool.prototype.isLeftRightTool_ = function() {
  return false;
};


/**
 * Move the tool to the specified mouse position
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tool.prototype.move = function(mouseCoords) {
  var offsetX = this.mouseOffset.x;

  if (mouseCoords.relX > 0 && this.isLeftRightTool_()) {
    offsetX = this.width - this.mouseOffset.x;
  }

  this.el.css({
    left: mouseCoords.x - (offsetX * mouseCoords.scale),
    top: mouseCoords.y - (this.mouseOffset.y * mouseCoords.scale) + window.santaApp.headerSize,
  });

  var shouldAnimate = this.shouldAnimate_(mouseCoords);
  if (shouldAnimate === this.isAnimating) {
    return;
  }
  this.isAnimating = shouldAnimate;
  if (this.isAnimating) {
    this.animationEl.show();

    this.animationPlayer.currentTime = 0;
    this.animationPlayer.play();
  } else {
    if (this.animateInfinitely) {
      this.animationEl.hide();
      this.animationPlayer.pause();
    }
  }
};


/**
 * Initializes the optional animation for when the tool is used.
 * @private
 */
app.Tool.prototype.initAnimation_ = function() {
  if (this.el.find('.Tool-animation').length) {
    this.animationEl = this.el.find('.Tool-animation');
  }

  var animation = this.createAnimation_();
  if (!animation) {
    return;
  }

  this.animateInfinitely = animation.timing.iterations === Infinity;
  this.animationPlayer = document.timeline.play(animation);
  this.animationPlayer.pause();
};


/**
 * Should be subclassed to create a web Animation instance for the tool effect.
 * @return {AnimationEffectReadOnly}
 * @private
 */
app.Tool.prototype.createAnimation_ = function() {
  return null;
};


/**
 * Evaluate if the tool should play its animation. Should be overwritten if
 * relevant.
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 * @return {boolean}
 * @private
 */
app.Tool.prototype.shouldAnimate_ = function(mouseCoords) {
  if (this.animationPlayer) {
    return mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM;
  }
  return false;
};

/**
 *
 */
app.Tool.prototype.draw = function(context, mouseCoords, scale) {
  return null;
}
