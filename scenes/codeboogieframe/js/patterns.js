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

goog.provide('app.Patterns');
goog.require('Blockly.utils');

/**
 * A singleton utility to inject patterns into Blockly's svg.
 */
app.Patterns = (function() {
  var created_ = {};
  var defsEl = null;
  var pendingPatterns = [];

  /**
   * Have we already created an svg element for this patternInfo?  Throws if
   * we ask with a patternInfo that has the same id but different attributes.
   * @return {boolean} true if the pattern already exists.
   */
  var wasCreated_ = function(patternInfo) {
    var equal = true;
    var cached = created_[patternInfo.id];
    if (!cached) {
      return false;
    }

    Object.keys(patternInfo).forEach(function(key) {
      if (patternInfo[key] !== cached[key]) {
        equal = false;
      }
    });
    if (!equal) {
      throw new Error("Can't add attribute of same id with different attributes");
    }
    return true;
  };

  /**
   * Mark that we've created an svg pattern
   */
  var markCreated_ = function(patternInfo) {
    created_[patternInfo.id] = patternInfo;
  };

  return {
    /**
     * Add an svg pattern for the given image. If document is not yet fully loaded,
     * it will add the pattern to a list for later.
     *
     * @param {string} id Pattern name
     * @param {string} imagePath Url of the image
     * @param {number} width Width of the image
     * @param {number} height Height of the image
     * @param {number|function} offsetX Offset of the image to start pattern
     * @param {number|function} offsetY Offset of the image to start pattern
     * @return {string} id of the pattern
     */
    addPattern: function(id, imagePath, width, height, offsetX, offsetY) {
      var x, y, pattern, patternImage,
          patternInfo = {
        id: id,
        imagePath: imagePath,
        width: width,
        height: height,
        offsetX: offsetX,
        offsetY: offsetY
      };

      if (!wasCreated_(patternInfo)) {
        // add the pattern
        x = typeof(offsetX) === 'function' ? -offsetX() : -offsetX;
        y = typeof(offsetY) === 'function' ? -offsetY() : -offsetY;
        pattern = Blockly.createSvgElement('pattern', {
          id: id,
          patternUnits: 'userSpaceOnUse',
          width: '100%',
          height: '100%',
          x: x,
          y: y
        });
        patternImage = Blockly.createSvgElement('image', {
          width: width,
          height: height
        }, pattern);
        patternImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                                    imagePath);

        markCreated_(patternInfo);

        if (defsEl) {
          defsEl.appendChild(pattern);
        } else {
          pendingPatterns.push(pattern);
        }
      }
      return id;
    },

    inject: function() {
      defsEl = document.getElementById('blocklySvgDefs');
      pendingPatterns.forEach(function(pattern) {
        defsEl.appendChild(pattern);
      });
    }
  };
})();
