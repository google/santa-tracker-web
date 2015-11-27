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
  HINT_BUTTON_PAN_TIME: 0.6, // seconds
  HINT_RANDOM_DISTANCE: 25, // percentage of map (0 - 100)
  SPAWNS: {
    'museum': {
      'santa': [
        'SANTA-1',
        'SANTA-2',
        'SANTA-3',
        'SANTA-4',
        'SANTA-5',
        'SANTA-6',
        'SANTA-7',
        'SANTA-8',
      ]
      /*
      'santa': [
        {
          className: 'character-hiding--museum-santa-1',
          aspectRatio: 76 / 100,
          heightScale: 101 / 1080, // if map height was 1080px
          locationScale: {
            left: 0.039,
            top: 0.6934
          }
        }
      ]*/
    }
  }
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
