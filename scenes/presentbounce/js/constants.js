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
  TOTAL_LEVELS: 10,


  INITIAL_COUNTDOWN: 40, // in seconds
  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  // GRAVITY: 300,
  // PHYSICS_SCALE: 1 / 100,
  // MIN_PHYSICS_FPS: 1 / 50,

  // TUTORIAL_ARROW_TIMEOUT: 5000,

  // /**
  //  * Levels and boards (layouts) are specified separately.
  //  * The level specifies a board by name and an array of
  //  * ball spawn x positions, relative to the board center.
  //  */
  LEVELS: [
  //   {
  //     board: 'easy',
  //     balls: [{x: -200}]
  //   },
  //   {
  //     board: 'easy',
  //     balls: [{x: -200}, {x: -250}]
  //   },
  //   {
  //     board: 'easy',
  //     balls: [{x: 100}, {x: 50}, {x: 0}, {x: -50}, {x: -100}, {x: -150}, {x: -200}, {x: -250}, {x: -300}]
  //   },
  //   {
  //     board: 'board2',
  //     balls: [{x: -250}, {x: 250}]
  //   },
  //   {
  //     board: 'board2',
  //     balls: [{x: 250}, {x: -250}, {x: 250}]
  //   }
  ]

};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
