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

goog.provide('Constants');
goog.provide('app.Constants');


/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  LEVEL_COUNT: 5,
  INITIAL_COUNTDOWN: 60, // in seconds
  TIME_PER_LEVEL: 20,

  COUNTDOWN_TRACK_LENGTH: 90, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  PRESENT_SCORE: 10,

  COLORS: ['red', 'green', 'blue', 'pink', 'cyan'],
  NUMBERS: [1, 2, 3, 4, 5],

  PRESENTS_PER_LEVEL: [2, 4, 8, 16, 50],
  BELT_SPEED_PER_LEVEL: [0, 32, 50, 64, 96],
  BELT_CYCLE_DISTANCE: 240 * 5,

  PRESENT_SPAWN_WIDTH: 152,
  PRESENT_WIDTH: 130,
  MATCH_TIME: 3,
  MISS_TIME: -6
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
