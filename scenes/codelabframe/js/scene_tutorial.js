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

goog.provide('app.SceneTutorial');

/**
 * Manages the display of a tutorial animation for the game.
 * @param {!Element} el the .tutorial element.
 * @constructor
 */
app.SceneTutorial = function(el) {
  this.el = el;

  this.visible_ = false;
  this.scheduleTimeout_ = null;

  this.boundOnClick_ = this.onClick_.bind(this);
  this.boundOnBlocklyChange_ = this.onBlocklyChange_.bind(this);
  this.boundOnBlocklyClickBlock_ = this.onBlocklyClickBlock_.bind(this);

  this.el.addEventListener('click', this.boundOnClick_, false);
  document.body.addEventListener('blocklyDragBlock',
      this.boundOnBlocklyChange_, false);
  document.body.addEventListener('blocklyClickFlyoutBlock',
      this.boundOnBlocklyClickBlock_, false);
};

/**
 * Dispose of this SceneTutorial.
 */
app.SceneTutorial.prototype.dispose = function() {
  this.el.removeEventListener('click', this.boundOnClick_, false);
  document.body.removeEventListener('blocklyDragBlock',
      this.boundOnBlocklyChange_, false);
  document.body.removeEventListener('blocklyClickFlyoutBlock',
      this.boundOnBlocklyClickBlock_, false);
};

/**
 * Schedules displaying the tutorial. Only happens max once, some time after the
 * first time requested.
 */
app.SceneTutorial.prototype.schedule = function() {
  // Blockly does some non-user initiated workspace changes on timeout, so we wait for
  // them to finish.
  this.scheduleTimeout_ = window.setTimeout(this.toggle.bind(this, true), 4000);
};

/**
 * Shows or hides the tutorial.
 * @param {boolean} visible is true to show the tutorial, otherwise false.
 */
app.SceneTutorial.prototype.toggle = function(visible) {
  if (this.scheduleTimeout_) {
    window.clearTimeout(this.scheduleTimeout_);
    this.scheduleTimeout_ = null;
  }

  this.visible_ = visible;
  this.el.style.display = visible ? 'block' : 'none';
};

/**
 * Hide the tutorial on tap/click.
 * @private
 */
app.SceneTutorial.prototype.onClick_ = function() {
  this.toggle(false);
};

/**
 * Hide the tutorial on edit blockly workspace.
 * @private
 */
app.SceneTutorial.prototype.onBlocklyChange_ = function() {
  if (this.visible_ || this.scheduleTimeout_) {
    this.toggle(false);
  }
};

/**
 * Show the tutorial on click toolbar block.
 * @private
 */
app.SceneTutorial.prototype.onBlocklyClickBlock_ = function() {
  this.toggle(true);
};
