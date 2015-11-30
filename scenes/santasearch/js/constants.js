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
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  ZOOM_MAX: 4,
  ZOOM_STEP_SIZE: 0.5,
  PRESCALE_TIME: 0.3, // seconds
  HINT_ZOOM: 2,
  HINT_BUTTON_PAN_TIME: 0.6, // seconds
  HINT_RANDOM_DISTANCE: 15, // percentage of map (0 - 100)
  CHARACTERS: ['santa', 'penguin', 'gingerbread-man', 'rudolph', 'pegman', 'mrs-claus'],
  SPAWNS: {
    museum: {
      santa: [
        'SANTA-1',
        'SANTA-2',
        'SANTA-3',
        'SANTA-4',
        'SANTA-5',
        'SANTA-6',
      ],
      'gingerbread-man': [
        'GINGERBREADMAN-1',
        'GINGERBREADMAN-2',
        'GINGERBREADMAN-3',
        'GINGERBREADMAN-4',
        'GINGERBREADMAN-5',
        'GINGERBREADMAN-6',
      ],
      penguin: [
        'PENGUIN-1',
        'PENGUIN-2',
        'PENGUIN-3',
        'PENGUIN-4',
        'PENGUIN-5',
        'PENGUIN-6',
        'PENGUIN-7',
      ],
      rudolph: [
        'RUDOLPH-1',
        'RUDOLPH-7',
      ],
      'mrs-claus': [
        'MRSCLAUS-1',
        'MRSCLAUS-2',
        'MRSCLAUS-3',
        'MRSCLAUS-4',
        'MRSCLAUS-5',
        'MRSCLAUS-6',
      ],
      pegman: [
        'PEGMAN-1',
        'PEGMAN-2',
        'PEGMAN-3',
        'PEGMAN-4',
        'PEGMAN-5',
        'PEGMAN-6',
        'PEGMAN-7',
      ],
    },
  },

  // Used by the shared scoreboard but not this game
  INITIAL_COUNTDOWN: 0,
  COUNTDOWN_TRACK_LENGTH: 0,
  COUNTDOWN_FLASH: 0,
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
