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

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  // Countdown, in seconds
  INITIAL_COUNTDOWN: 60,
  TIME_PER_CHIMNEY: 3,
  TOTAL_LEVELS: 10,

  // Scoring.
  SCORE_CHIMNEY_LARGE: 10,
  SCORE_CHIMNEY_SMALL: 20,

  CHIMNEY_START_SPEED: 150,
  CHIMNEY_SPEED_PER_LEVEL: 30,
  CHIMNEY_SPAWN_INTERVAL: 3.0,
  CHIMNEY_SPAWN_VARIANCE: 2.0,
  CHIMNEY_SPAWN_MULTIPLY_EACH_LEVEL: 0.80,
  CHIMNEY_SPAWN_BASE: 0.5,
  CHIMNEY_START_X: 1000,
  CHIMNEY_END_X: -300,
  CHIMNEY_WIDTH_SMALL: 70,
  CHIMNEY_WIDTH_LARGE: 90,
  CHIMNEY_Y_SMALL: 655 - 131,
  CHIMNEY_Y_LARGE: 655 - 158,
  CHIMNEY_FLAG_VISIBLE: 600, // ms

  PRESENT_INITIAL_VELOCITY: 0,
  PRESENT_GRAVITY: 2000,

  PRESENT_WIDTH: 20,
  PRESENT_START_Y: 102,
  PRESENT_END_Y: 660,

  TIME_BETWEEN_PRESENTS: 0.5,

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  // Seconds left when countdown starts flashing
  COUNTDOWN_FLASH: 10,

  // Pixels per second. To make instant, use big enough number :)
  PLAYER_MAX_SPEED: 400,
  PLAYER_CENTER: 150,
  PLAYER_MIN_X: 225,
  PLAYER_MAX_X: 680,
  PLAYER_START_X: 450,

  // Duration in seconds. Will be rounded to next FG transition.
  LEVEL_DURATION: 21,
  // Number of level themes.
  LEVEL_COUNT: 4,
  LEVEL_BG_WIDTH: 890,
  LEVEL_FG_WIDTH: 932,
  LEVEL_BG_TRANSITION: 2,
  LEVEL_FG_TRANSITION: 7,

  TUTORIAL_SPACE_TIMEOUT: 5000,
  TUTORIAL_ARROW_TIMEOUT: 3000
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
