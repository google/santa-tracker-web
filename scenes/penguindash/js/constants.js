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
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  TOTAL_LEVELS: 10, // number of levels
  INITIAL_COUNTDOWN: 0, // count up, so start count at zero
  TIME_LOSE: 20, // number of seconds to lose when you die/restart

  MOVEMENT_FORCE: 10, // velocity

  POINTS_LEVEL_COMPLETE: 500, // pts for completing a level
  POINTS_GIFT_BASIC: 100, // pts for hitting a gift

  TUTORIAL_LEFTRIGHT_TIMEOUT: 5000,
  TUTORIAL_UPDOWN_TIMEOUT: 3000,

  SPEED_DECAY_FAST: 0.93, // inertia when in water
  SPEED_DECAY_DEFAULT: 0.98, // inertia while on snow
  SPEED_MULTIPLE_DEFAULT: 1, // default velocity multiple
  SPEED_MULTIPLE_FAST: 2, // velocity multiple on ice
  SPEED_MOVING_ICE: 2000, // transition time for moving ice

  WORLD_WIDTH: 4000,
  WORLD_HEIGHT: 3000,

  PENGUIN_STATES: {
    sliding: 0,
    accelerating: 1,
    falling: 2,
    celebrating:3
  },

  /**
   * All the different types of scenery.
   *
   * Id for reference.
   * Continue var if overlap should continue game.
   * Additional functionality for update callback.
   * Additional functionality for init callback.
   * @type {Array.<Constants.GROUPS>}
   */
  GROUPS: [
    // Presents
    {id: 'prize', continue: true, init: ['prize'], update: ['prize']},
    {id: 'obstacle', continue: false, front: true, init: ['obstacle'], update: ['collide']},
    {id: 'finish', update: ['finish']},
    {id: 'ice', continue: true, update: ['fast']},
    {id: 'moving', continue: true, init: ['moving'], update: ['moving']},
    {id: 'snow', continue: true},
    {id: 'scenery', continue: false},
    {id: 'shadow', continue: false},
    {id: 'character', continue: true}
  ],

  OBSTACLES: {
    coal1: {width: 82, height: 82, offsetX: 110, offsetY: 80, square: true},
    coal2: {width: 150, height: 102, offsetX: 135, offsetY: 100, square: true},
    coal3: {width: 160, height: 160, offsetX: 145, offsetY: 105, square: true},
    tree1: {width: 240, height: 240, offsetX: 380, offsetY: 110, square: true},
    tree2: {width: 400, height: 400, offsetX: 480, offsetY: 240, square: true},
    pole: {width: 50, height: 50, offsetX: 0, offsetY: 0, square: true}
  },

  CHARACTERS: {
    duck: [0,1,2,3,4,5,6,7,8,9,10,11,10,9,8,7,6,5,4,3,2,1,0],
    walrus: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,16,16,
      15,14,13,13,13,14,15,16,16,16,15,14,13,13,13,14,15,16,
      16,16,15,14,13,13,13,14,15,16,16,16,15,14,13,12,11,10,
      9,8,7,6,5,4,3,2,1,0]
  }
};


Constants = app.Constants;
