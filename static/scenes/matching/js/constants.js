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
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
var Constants = {
  DOOR_COUNT: 12,
  LAST_LEVEL: 5,
  INITIAL_COUNTDOWN: 30, // in seconds
  MINIMUM_COUNTDOWN: 5, // in seconds

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  SCORE_MATCH: 50,
  SCORE_LEVEL_UP: 500,

  TIME_PER_LEVEL: 30,
  MAX_TIME: 120,

  MISMATCH_TIMEOUT: 400,

  LEVEL_CAP_DURATION: 15, // in seconds
  SLIDING_DOOR_DURATION: 400, // in milliseconds

  MAX_OPEN_DOORS: 2,

  SELECTOR_DOOR: '.door',
  SELECTOR_DOOR_TARGET: '.door-target',
  SELECTOR_CARD: '.card',

  CLASS_FIGURE_PREFIX: 'card--figure-',
  CLASS_DOOR_OPEN: 'door--open',
  CLASS_DOOR_ENABLED: 'door--enabled'
};
