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

goog.provide('app.config');

app.config = {

  //
  'handwriting_url': "https://inputtools.google.com/request?ime=handwriting&app=quickdraw&dbg=1&cs=1&oe=UTF-8",
  'handwriting_threshold' : 4.0,
  'handwriting_recognition_threshold' : 2.0,

  // Duration of game in seconds
  'round_length': 20,

  // 'num_rounds': 2,
  'num_rounds': 3,

  // Max allowed rate recognition api can be called in seconds
  'max_api_rate': 1.0,

  // Seconds on splashscreen until word list gets reset
  'gameSplashscreenTimeout': 20,
  'userNotDrawingTimeout': 7,

  // Keys found in Translations class
  'noNewGuessesSentences': ["no_clue", "not_sure", "stumped"],
  'timesUpSentences': ["sorry"],
  'userNotDrawingSentences': ["cant_guess", "start_drawing"],
  'words': ["tree", "star", "snowflake", "snowman", "cookie", "penguin"]
}
