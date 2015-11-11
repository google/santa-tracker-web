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

/**
 * A singleton utility to inject patterns into Blockly's svg.
 */
app.Patterns = (function() {
  var queued_ = [];
  var created_ = {};
  var timeoutId_ = null;

  /**
   * Stick an item in our queue
   */
  var addToQueue_ = function(patternInfo) {
    queued_.push(patternInfo);
    if (!timeoutId_) {
      addQueuedPatternsWhenReady_();
    }
  };

  /**
   * Add all the svg patterns we've queued up.
   */
  var addQueuedPatterns_ = function() {
    queued_.forEach(function(pattern) {
      app.Patterns(pattern.id, pattern.imagePath, pattern.width, pattern.height,
                      pattern.offsetX, pattern.offsetY);
    });
    queued_ = [];
  };

  var addQueuedPatternsWhenReady_ = function() {
    if (!isReady_()) {
      timeoutId_ = setTimeout(addQueuedPatternsWhenReady_, 100);
      return;
    }
    timeoutId_ = null;
    addQueuedPatterns_();
  };

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
   * Checks if blockly is ready to receive patterns.
   * @return {boolean}
   * @private
   */
  var isReady_ = function() {
    return !!document.getElementById('blocklySvgDefs');
  };

  /**
   * Mark that we've created an svg pattern
   */
  var markCreated_ = function(patternInfo) {
    if (created_[patternInfo.id]) {
      throw new Error('Already have cached item with id: ' + patternInfo.id);
    }
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
      var x, y, pattern, patternImage;
      var patternInfo = {
        id: id,
        imagePath: imagePath,
        width: width,
        height: height,
        offsetX: offsetX,
        offsetY: offsetY
      };

      if (!isReady_()) {
        addToQueue_(patternInfo);
      } else if (!wasCreated_(patternInfo)) {
        // add the pattern
        x = typeof(offsetX) === 'function' ? -offsetX() : -offsetX;
        y = typeof(offsetY) === 'function' ? -offsetY() : -offsetY;
        pattern = Blockly.createSvgElement('pattern', {
          id: id,
          patternUnits: 'userSpaceOnUse',
          width: '100%',
          height: height,
          x: x,
          y: y
        }, document.getElementById('blocklySvgDefs'));
        patternImage = Blockly.createSvgElement('image', {
          width: width,
          height: height
        }, pattern);
        patternImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                                    imagePath);

        markCreated_(patternInfo);
      }
      return id;
    }
  };
})();
