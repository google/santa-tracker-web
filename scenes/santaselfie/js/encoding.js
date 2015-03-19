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

goog.provide('app.encoding');


/**
 * Provides run length encoding functions
 * @return {encode: {function}, decode: {function}} Functions to encode and decode strings
 */
app.encoding = {
  encode: function(data) {
    var current = data[0];
    var encoded = '';
    var counter = 1;

    for (var i = 0; i < data.length; i++) {
      var next = data[i + 1];

      if (current === next) {
        counter++;
      } else {
        encoded += counter;
        encoded += current;

        current = data[i + 1];
        counter = 1;
      }
    }

    return encoded;
  },

  decode: function(encoded) {
    var runLengthMatcher = new RegExp('([0-9]+)', 'g');
    var charMatcher = new RegExp('([A-Za-z])', 'g');

    var runLengths = encoded.match(runLengthMatcher);
    var chars = encoded.match(charMatcher);

    var decoded = '';

    for (var i = 0; i < chars.length; i++) {
      var current = chars[i];
      var counter = runLengths[i];

      while (counter--) {
        decoded += current;
      }
    }

    return decoded;
  }
};
