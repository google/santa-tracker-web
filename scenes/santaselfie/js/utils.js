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

goog.provide('app.utils');



app.utils = function() {
  var audioProxy = {};

  return {
    distance: function(x, y) {
      return Math.sqrt(x * x + y * y);
    },

    randomLoop: function(fn, minInterval, maxInterval) {
      var random = Math.max(minInterval, Math.random() * maxInterval);

      window.setTimeout(function() {
        fn();
        app.utils.randomLoop(fn, minInterval, maxInterval);
      }, random);
    },

    triggerStart: function(event) {
      if (!audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event + '_start');
        audioProxy[event] = true;
      }
    },

    triggerStop: function(event) {
      if (audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event + '_stop');
        audioProxy[event] = false;
      }
    },

    triggerOnce: function(event) {
      if (!audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event);
        audioProxy[event] = true;
      }
    },

    triggerReset: function(event) {
      audioProxy[event] = false;
    }
  };
}();
