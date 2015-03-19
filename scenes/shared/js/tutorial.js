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


goog.provide('app.shared.Tutorial');

// We are *leaking* the Tutorial global for backwards compatibility.
app.shared.Tutorial = Tutorial;

/**
 * Tutorial animation.
 * Can be used to explain: mouse click, space press, arrows,
 * touch swipe, rotate the device, tilting, tap the screen,
 * and how to play matching.
 * @constructor
 * @param {!Element} moduleElem The module element.
 * @param {string} touchTutorials Tutorials when touch is enabled.
 * @param {string} notouchTutorials Tutorials when touch is disabled.
 */
function Tutorial(moduleElem, touchTutorials, notouchTutorials) {
  // Ability to disable tutorial
  this.enabled = true;
  this.first = true;
  this.hasTouch = Modernizr.touch;

  // Tutorial element
  this.elem = $('<div class="tutorial"><div class="tutorial-inner"></div></div>');
  $(moduleElem).append(this.elem);

  if (this.hasTouch) {
    this.tutorials = touchTutorials.split(' ');
  } else {
    this.tutorials = notouchTutorials.split(' ');
  }

  this.onTimeout_ = this.onTimeout_.bind(this);
}

// Default timeouts
Tutorial.FIRST_TIMEOUT = 5000;
Tutorial.SECOND_TIMEOUT = 3000;

/**
 * Start the tutorial timer.
 */
Tutorial.prototype.start = function() {
  if (!this.tutorials.length) {
    return;
  }

  this.timer = window.setTimeout(this.onTimeout_,
    this.first ? Tutorial.FIRST_TIMEOUT : Tutorial.SECOND_TIMEOUT);
  this.first = false;
};

/**
 * Turn off a tutorial because user has already used the controls.
 * @param {string} name The name of the tutorial.
 */
Tutorial.prototype.off = function(name) {
  this.tutorials = this.tutorials.filter(function(tut) {
    return tut != name;
  });

  // Stop timer if no tutorials are left
  if (!this.tutorials.length) {
    this.dispose();
  }

  // Hide tutorial if the current one is turned off
  if (this.current === name) {
    this.hide_();
    this.start();
  }
};

/**
 * When the wait has ended.
 */
Tutorial.prototype.onTimeout_ = function() {
  this.show_(this.tutorials.shift());
};

/**
 * Display a tutorial.
 */
Tutorial.prototype.show_ = function(name) {
  this.current = name;
  this.elem.addClass(name).show();
};

/**
 *  Hide the tutorial
 */
Tutorial.prototype.hide_ = function() {
  this.elem.hide().removeClass(this.current);
};

/**
 * Cleanup
 */
Tutorial.prototype.dispose = function() {
  window.clearTimeout(this.timer);
};
