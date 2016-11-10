/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('Turtle.SceneTutorial');

/**
 * Manages the display of a tutorial animation for the game.
 * @param {Element} el the .tutorial element.
 * @constructor
 */
Turtle.SceneTutorial = function(el) {
  this.el = el;

  this.visible_ = false;
  this.scheduleTimeout_ = null;

  this.hasBeenShown = false;
  this.boundOnClick_ = this.onClick_.bind(this);
  this.boundOnBlocklyChange_ = this.onBlocklyChange_.bind(this);

  document.addEventListener('click', this.boundOnClick_, false);
  Blockly.getMainWorkspace().addChangeListener(this.boundOnBlocklyChange_);
};

/**
 * Dispose of this SceneTutorial.
 */
Turtle.SceneTutorial.prototype.dispose = function() {
  document.removeEventListener('click', this.boundOnClick_, false);
};

/**
 * Schedules displaying the tutorial. Only happens max once, some time after the
 * first time requested.
 */
Turtle.SceneTutorial.prototype.schedule = function(force) {
  if (this.hasBeenShown && !force) { return; }

  // Blockly does some non-user initiated workspace changes on timeout, so we wait for
  // them to finish.
  this.scheduleTimeout_ = window.setTimeout(this.toggle.bind(this, true), 300);
};

/**
 * Shows or hides the tutorial.
 * @param {boolean} visible is true to show the tutorial, otherwise false.
 */
Turtle.SceneTutorial.prototype.toggle = function(visible) {
  if (this.scheduleTimeout_) {
    window.clearTimeout(this.scheduleTimeout_);
    this.scheduleTimeout_ = null;
  }

  this.hasBeenShown = this.hasBeenShown || visible;
  this.visible_ = visible;
  this.el.hidden = !visible;
};

/**
 * Hide the tutorial on tap/click.
 * @private
 */
Turtle.SceneTutorial.prototype.onClick_ = function() {
  this.toggle(false);
};

/**
 * Hide the tutorial on edit blockly workspace.
 * @private
 */
Turtle.SceneTutorial.prototype.onBlocklyChange_ = function(event) {
  if (event.type == Blockly.Events.MOVE && event.blockId != Blockly.getMainWorkspace().topBlocks_[0].id) {
    if (this.visible_ || this.scheduleTimeout_) {
      this.toggle(false);
    }
    Blockly.getMainWorkspace().removeChangeListener(this.onBlocklyChange_);
  }
};

/**
 * Show the tutorial on click toolbar block.
 * @private
 */
Turtle.SceneTutorial.prototype.onBlocklyClickBlock_ = function() {
  this.toggle(true);
};
