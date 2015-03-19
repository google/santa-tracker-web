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

/**
 * Gameplay constants
 * @const
 */
var Constants = {
  INITIAL_COUNTDOWN: 30, // in seconds
  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  TOUCH_SENSITIVITY: 85, // Pixels dragged to reach max speed.

  TUTORIAL_LEFTRIGHT_TIMEOUT: 3000,
  TUTORIAL_UPDOWN_TIMEOUT: 5000,

  PRESENT_HIT_SCORE: 100,
  LEVEL_UP_SCORE: 500,

  TOTAL_LEVELS: 10
};
