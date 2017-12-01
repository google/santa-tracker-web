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

    angle: function(point1, point2) {
      return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    },

    midpoint: function(start, end) {
      return {
        x: start.x + (end.x - start.x) / 2,
        y: start.y + (end.y - start.y) / 2
      };
    },

    pointInCurve: function(t, start, control, end) {
      var u = (1 - t);
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

    curveLength: function(start, control, end) {
      var ax = start.x - 2 * control.x + end.x;
      var ay = start.y - 2 * control.y + end.y;
      var bx = 2 * control.x - 2 * start.x;
      var by = 2 * control.y - 2 * start.y;
      var A = 4 * (ax * ax + ay * ay);
      var B = 4 * (ax * bx + ay * by);
      var C = bx * bx + by * by;

      var Sabc = 2 * Math.sqrt(A+B+C);
      var A_2 = Math.sqrt(A);
      var A_32 = 2 * A * A_2;
      var C_2 = 2 * Math.sqrt(C);
      var BA = B / A_2;

      return (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
    },


    map: function(value, min, max) {
      return min + (max - min) * value;
    },

    svgToImage: function(svgString, callback) {
      var data = svgString;
      var DOMURL = window.URL || window.webkitURL || window;

      var img = new Image();
      var svg = new Blob([data], {type: 'image/svg+xml'});
      var url = DOMURL.createObjectURL(svg);

      if (callback) {
        img.onload = function() {
          callback(img);
        }
      }

      img.src = url;
      return img;
    },

    simpleTimeout: function(fn) {
      window.setTimeout(fn, 0);
    },

    randomLoop: function(fn, minInterval, maxInterval) {
      var random = Math.max(minInterval, Math.random() * maxInterval);

      window.setTimeout(function() {
        fn();
        app.utils.randomLoop(fn, minInterval, maxInterval);
      }, random);
    },

    triggerStart: function(event, args) {
      if (!audioProxy[event]) {
        args = args || [];
        window.santaApp.fire('sound-trigger', 'cd_stop_all_drawing');
        window.santaApp.fire('sound-trigger', {name: this.cleanNameForKlang(event) + '_start', args: args});
        audioProxy[event] = true;
      }
    },

    triggerStop: function(event) {
      if (audioProxy[event]) {
        window.santaApp.fire('sound-trigger', 'cd_stop_all_drawing');
        window.santaApp.fire('sound-trigger', this.cleanNameForKlang(event) + '_stop');
        audioProxy[event] = false;
      }
    },

    triggerOnce: function(event, args) {
      if (!audioProxy[event]) {
        args = args || [];
        window.santaApp.fire('sound-trigger', {name: event, args: args});
        audioProxy[event] = true;
      }
    },

    triggerReset: function(event) {
      audioProxy[event] = false;
    },

    cleanNameForKlang: function(event) {
      return 'cd_' + event.replace(/-/ig, '_')
    }
  };
}();
