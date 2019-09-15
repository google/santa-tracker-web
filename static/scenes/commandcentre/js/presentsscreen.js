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

goog.provide('app.PresentsScreen');

goog.require('app.Constants');
goog.require('app.PresentsBelt');
goog.require('app.shared.utils');



/**
 * Main PresentsScreen class
 * @param {!Element} elem a DOM element context for the screen
 * @constructor
 */
app.PresentsScreen = function(elem) {
  this.$el = $(elem);
  this.$leftBeltEl = this.$el.find('.presents-screen__belt--left');
  this.$rightBeltEl = this.$el.find('.presents-screen__belt--right');
  this.isActive = false;
};

app.PresentsScreen.prototype = {

  /**
   * Tell screen that it is visible
   */
  onActive: function() {
    this.isActive = true;
    this.leftBelt = new app.PresentsBelt(this.$leftBeltEl);
    this.rightBelt = new app.PresentsBelt(this.$rightBeltEl, {direction: 'rtl', timeOffset: -1});

    window.santaApp.fire('sound-trigger', 'command_conveyor_start');
  },

  /**
   * Tell screen that it is hidden
   */
  onInactive: function() {
    this.isActive = false;
    if (this.leftBelt && this.rightBelt) {
      this.leftBelt.destroy();
      this.rightBelt.destroy();
    }

    window.santaApp.fire('sound-trigger', 'command_conveyor_stop');
  }

};
