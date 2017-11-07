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
    distance: function(p1, p2) {
      var x = p2.x - p1.x;
      var y = p2.y - p1.y;
      return Math.sqrt(x * x + y * y);
    },

    angle: function(x1, y1, x2, y2) {
      return Math.atan2(x2 - x1, y2 - y1);
    },

    pointInCurve: function(t, start, control, end) {
      var u = (1 - t);
      // var x = u * (u * start.x + (t * control.x)) + t * ((u * control.x + (t * end.x)));
      // var y = u * (u * start.y + (t * control.y)) + t * ((u * control.y + (t * end.y)));
      var x = u * u * start.x + 2 * u * t * control.x + t * t * end.x;
      var y = u * u * start.y + 2 * u * t * control.y + t * t * end.y;
      var dx = (u * control.x + t * end.x) - (u * start.x + t * control.x);
      var dy = (u * control.y + t * end.y) - (u * start.y + t * control.y);

      return {
        x: x,
        y: y,
        angle: Math.atan2(dy, dx)
      };
    },

    map: function(value, min, max) {
      return min + (max - min) * value;
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
