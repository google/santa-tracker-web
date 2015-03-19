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

goog.provide('app.WindsockScreen');

goog.require('app.shared.utils');



/**
 * Main WindsockScreen class
 * @constructor
 */
app.WindsockScreen = function() {
  this.isActive = false;
};

app.WindsockScreen.prototype = {

  /**
   * Tell screen that it is visible
   * @public
   */
  onActive: function() {
    this.isActive = true;
    window.santaApp.fire('sound-trigger', 'command_wind_start');
  },

  /**
   * Tell screen that it is hidden
   * @public
   */
  onInactive: function() {
    this.isActive = false;
    window.santaApp.fire('sound-trigger', 'command_wind_stop');
  }

};
