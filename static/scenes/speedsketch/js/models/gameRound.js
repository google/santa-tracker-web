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

goog.provide('app.GameRound');


/**
 * @constructor
 */
app.GameRound = function(data, level) {
  this.word = data.word;
  this.presentationWord = data.word;
  this.startTime = new Date();
  this.recognized = false;
  this.level = level;
  this.recognitions = [];
  this.width = 0;
  this.height = 0;
};


app.GameRound.prototype.getElapsedTime = function() {
  var now = new Date();
  return (now.getTime() - this.startTime.getTime()) / 1000.0;
};
