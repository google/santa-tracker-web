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

goog.provide('app.SpeechController');
goog.require('app.Utils');

/**
 * @constructor
 */
app.SpeechController = function() {
  this.supported = false;
  this.synth = window.speechSynthesis;

  if(this.synth) {
    this.supported = true;
    this.synth.getVoices();
  }
};

app.SpeechController.prototype.speak = function(text, callback) {
  if (this.supported) {
    text = text.replace(/'/gi, "’");
    var _callback = function() {
      if (callback) {
        callback();
      }
    };

    var utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = app.Utils.lang === 'en' ? 'en-US' : app.Utils.lang;

    utterThis.addEventListener('end', function() {
      _callback();
    });

    var _wait = function() {
      if (!this.synth.speaking) {
          _callback();
          return;
      }
      setTimeout(function() {
        _wait()
      }.bind(this), 200);
    }.bind(this);

    setTimeout(function() {
      _wait();
    }.bind(this), 500);

    utterThis.rate = 1.1;

    this.synth.speak(utterThis);
  }
};
