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

goog.provide('app.shared.Sceneboard');

// Load the old Constants global for backwards compatibility
goog.require('Constants');
goog.require('app.shared.SharedScene');
goog.require('app.shared.utils');

// We are *leaking* the Sceneboard global for backwards compatibility.
app.shared.Sceneboard = Sceneboard;

/**
 * A simpler version of Scoreboard, needed for the simpler functionality of
 * scenes but stripped of notions like score, timing, levels, etc.
 * @constructor
 * @struct
 * @param {!SharedScene} scene
 * @param {Element|!jQuery} elem The scoreboard element.
 */
function Sceneboard(scene, elem) {
  this.scene = scene;
  this.elem = $(app.shared.utils.unwrapElement(elem));

  this.attachEvents();

  // Initial state
  this.elem.find('.pause').removeClass('paused');
}

/**
 * Attaches events for scoreboard interactions.
 */
Sceneboard.prototype.attachEvents = function() {
  var self = this;  // intentionally held, so that 'this' is the element
  this.elem.find('.pause').on('click', function(event) {
    $(event.target).blur();

    $(this).toggleClass('paused');
    self.scene.togglePause();

    // TODO(bckenny): should this be firing global_pause? or handled elsewhere?
    if ($(this).hasClass('paused')) {
      window.santaApp.fire('sound-ambient', 'global_pause');
    } else {
      window.santaApp.fire('sound-ambient', 'global_unpause');
    }
  });
  this.elem.find('.restart').on('click', function(event) {
    $(event.target).blur();
    self.scene.restart();
  });
};
