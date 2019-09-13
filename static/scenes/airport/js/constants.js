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


goog.scope(function() {

  /**
   * Scene constants
   * @const
  */
  app.Constants = {

    OFFSET: -200, // start position offset outside of screen in pixels (should match CSS)
    MARGIN: 80, // px between items on belt
    DURATION: 40, // default time to move across belt

    STATE_NORMAL: 0,
    STATE_MEDIUM: 1,
    STATE_FAST: 2,

    TIMESCALE_NORMAL: 1,
    TIMESCALE_MEDIUM: 2,
    TIMESCALE_FAST: 4,

    CLASS_SPEED_NORMAL: '',
    CLASS_SPEED_MEDIUM: 'speed-mode--medium',
    CLASS_SPEED_FAST: 'speed-mode--fast',

    CLOSET_DRESS_ANIMATION_NAME: 'module-airport-outfit-cycle-#{color}',

    TYPE_ELF: 'elf',
    TYPE_REINDEER: 'reindeer',

    REINDEER_PROBABILITY: [true, true, false, false, false, false, false, false, false, false]
  };

});
