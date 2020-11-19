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
'use strict';

goog.provide('app.DrawingRecognitionController');
goog.require('app.EventEmitter');
goog.require('app.HandwritingAPI');
goog.require('app.Constants');


/**
 * Throttle calls to a function
 *
 * @param {!Function} func
 * @param {number} ms at most one per this many ms
 * @return {!Function}
 * @export
 */
function throttle(func, ms) {
  let timeout = 0;
  let last = 0;
  return function() {
    const a = arguments, t = this, now = +(new Date);
    const fn = function() {
      last = now;
      func.apply(t,a);
    };
    window.clearTimeout(timeout);
    (now >= last + ms) ? fn() : timeout = window.setTimeout(fn, ms);
  }
}


/**
 * @constructor
 */
app.DrawingRecognitionController = function() {
  app.EventEmitter.call(this);
  this.handwritingAPI = new app.HandwritingAPI();
  this.processDrawingThrottle = throttle(
    function(drawing) {
      this.processDrawing(drawing);
    }.bind(this),
    app.Constants.MAX_API_RATE * 1000
  );

  this.isRecognizing = false;
};


app.DrawingRecognitionController.prototype = Object.create(app.EventEmitter.prototype);


app.DrawingRecognitionController.prototype.start = function() {
  this.isRecognizing = true;
};


app.DrawingRecognitionController.prototype.stop = function() {
  this.isRecognizing = false;
};


app.DrawingRecognitionController.prototype.onDrawingUpdated = function(drawing) {
  this.processDrawingThrottle(drawing);
};


app.DrawingRecognitionController.prototype.processDrawing = function(drawing) {
  var segments = drawing.getSegments();
  var length = segments.reduce(function(memo, s) {
    return memo + s[0].length;
  }, 0);

  if (length > 10) {
    this.handwritingAPI.processSegments(segments, drawing.canvas.width, drawing.canvas.height)
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown);
    })
    .done(function(data) {
        this.processRecognitionResponse(this.handwritingAPI.parseResponse(data));
    }.bind(this));
  }
};

app.DrawingRecognitionController.prototype.processRecognitionResponse = function(results) {
  var guesses = this.filterGuesses(results);
  this.emit('NEW_RECOGNITIONS', guesses);
};

app.DrawingRecognitionController.prototype.filterGuesses = function(visionResults) {
  return visionResults.filter(function(result) {
    return result.score < app.Constants.HANDWRITING_THRESHOLD;
  });
};
