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

goog.provide('app.Constants');
goog.provide('Constants');



app.Constants = {
  INITIAL_COUNTDOWN: 20, // in seconds
  COUNTDOWN_TRACK_LENGTH: 20, // in seconds
  COUNTDOWN_FLASH: 2, // seconds left when countdown starts flashing

  QUESTIONS_PER_LEVEL: 10,
  TOTAL_LEVELS: 3,
  QUESTION_READ_TIME: 4, // seconds to read the question before choices are shown
  PAUSE_BETWEEN_QUESTIONS: 2,
  PAUSE_AFTER_ANSWER: 1,
  HIDE_QUESTION_TIME: 0.5,

  QUESTION_SCORE: 100,
  SCORE_PENALTY_PER_SECOND: 5,
  SCORE_LIMIT: {
    1: 500,  // Level: Score
    2: 1000
  },

  QUESTION_COUNT: {
    beginner: 97,
    medium: 100,
    hard: 105
  }
};

// For scoreboard
Constants = app.Constants;