/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('Constants');
goog.provide('app.Constants');

goog.require('app.I18n');

/**
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  INITIAL_COUNTDOWN: 0,
  COUNTDOWN_FLASH: 0,

  CANVAS_MAX_HEIGHT: 8000,

  TRACK_PIXELS_PER_BEAT: 150,
  ARROW_SIZE: {
    desktop: 80,
    mobile: 60
  },
  ARROW_MARGIN: 10,
  TRACK_LINE_POSITION: {
    desktop: 300,
    mobile: 120
  },
  ARROW_IMG_WIDTH: 40,
  ARROW_IMG_HEIGHT: 40,
  ARROW_MULTI_MARGIN: 25,
  COLORS: {
    ARROW_FILL: '#333',
    ARROW_PASSED_FILL: '#eee',
    ARROW_MULTI_FILL: '#484848',
    ARROW_MULTI_SHADOW: 'rgba(0, 0, 0, 0.2)',
    ARROW_MULTI_RAINBOW: [
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'indigo',
      'purple'
    ],
    TRACK_LINE: '#4d4d4d',
    TRACK_LINE_MEGA: '#eeeeee',
    POWERUP: 'rgba(0, 0, 0, 0.5)',
    POWERUP_SHADOW: 'rgba(255, 255, 255, 0.2)',
    POWERUP_SHINE: 'rgba(255, 255, 255, 0.5)',
    POWERUP_MARKER: '#d1febb',
    GRADIENT_START: '#00ffb5',
    GRADIENT_END: '#2ab4ff'
  },
  HIT_SCORES: {
    MISS: {
      points: 0,
      textKey: 'WB_feedback_miss',
      powerup: -.03
    },
    OK: {
      points: 10,
      textKey: 'WB_feedback_okay',
      accuracy: Number.MAX_VALUE,
      powerup: 0
    },
    GOOD: {
      points: 50,
      textKey: 'WB_feedback_good',
      accuracy: 25,
      powerup: .03
    },
    PERFECT: {
      points: 100,
      textKey: 'WB_feedback_perfect',
      accuracy: 10,
      powerup: .1
    },
    HOLD: {
      points: 1,
      powerup: .001
    },
    COMBO: {
      points: 50,
      powerup: .05
    }
  },
  ARROW_MULTI_HOLD_POINTS: 1,
  ARROW_MULTI_HOLD_POWERUP: .001,
  ARROW_MULTI_SHADOW_BLUR: 10,
  ARROW_MULTI_SHADOW_OFFSET: 2,
  COMBO_POINTS_BONUS: 50,
  COMBO_POWERUP_BONUS: .05,
  POWERUP_MARGIN: {
    desktop: 20,
    mobile: 10
  },
  POWERUP_INNER_MARGIN: {
    desktop: 5,
    mobile: 0
  },
  POWERUP_HEIGHT: {
    desktop: 30,
    mobile: 5
  },
  POWERUP_SHINE_POSITION: 17,
  POWERUP_SHINE_HEIGHT: {
    desktop: 4,
    mobile: 0
  },
  POWERUP_MARKER_WIDTH: {
    desktop: 3,
    mobile: 1
  },
  POWERUP_DECAY: 0.0035,

  ELF_LEFT_OFFSET: -120,
  ELF_RIGHT_OFFSET: 130,
  TOY_SIZE: 130,
  TOY_VERTICAL_OFFSET: 140,
  TOY_WRAP_OFFSET: 140,
  PRESENT_HEIGHT: 110,
  PRESENT_WIDTH: 150,
  PRESENT_VERTICAL_OFFSET: 150
};

/**
 * Keypress directions
 * @enum {number}
 */
app.Constants.DIRECTIONS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};


// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
