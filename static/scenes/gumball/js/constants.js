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
  INITIAL_COUNTDOWN: 40, // in seconds
  TIME_PER_LEVEL: 20,
  LESS_TIME_PER_CYCLE: 5,

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  SPAWNER_VELOCITY: 300,

  SPHERE_RADIUS: 19,
  SPHERE_RESPAWN_TIMER: 3.5,
  MAX_ANGLE: 9,
  ANGULAR_ACCELERATION: 360,
  MAX_ANGULAR_VELOCITY: 50,
  GEAR_SPEED: 3,
  GRAVITY: 300,
  PHYSICS_SCALE: 1 / 100,
  MIN_PHYSICS_FPS: 1 / 50,

  TUTORIAL_ARROW_TIMEOUT: 5000,

  /**
   * Levels and boards (layouts) are specified separately.
   * The level specifies a board by name and an array of
   * ball spawn x positions, relative to the board center.
   */
  LEVELS: [
    {
      board: 'easy',
      balls: [{x: -200}]
    },
    {
      board: 'easy',
      balls: [{x: -200}, {x: -250}]
    },
    {
      board: 'easy',
      balls: [{x: 100}, {x: 50}, {x: 0}, {x: -50}, {x: -100}, {x: -150}, {x: -200}, {x: -250}, {x: -300}]
    },
    {
      board: 'board2',
      balls: [{x: -250}, {x: 250}]
    },
    {
      board: 'board2',
      balls: [{x: 250}, {x: -250}, {x: 250}]
    },
    {
      board: 'board3',
      balls: [{x: -250}, {x: 150}]
    },
    {
      board: 'slideTight',
      balls: [{x: -250}]
    },
    {
      board: 'board4',
      balls: [{x: -250}, {x: -200}, {x: -150}]
    },
    {
      board: 'board4',
      balls: [{x: 250}, {x: 250}, {x: 250}, {x: 250}, {x: 250}, {x: 250}]
    },
    {
      board: 'board4',
      balls: [{x: 250}, {x: 250}, {x: 250}, {x: -200}, {x: -250}]
    },
    {
      board: 'board5',
      balls: [{x: -270}, {x: -270}, {x: -270}]
    },
    {
      board: 'board6',
      balls: [{x: -270}, {x: 250}, {x: 290}, {x: -270}]
    },
    {
      board: 'board7',
      balls: [{x: 0}]
    },
    {
      board: 'board7',
      balls: [{x: -340}, {x: -100}, {x: 0}, {x: 170}, {x: 300}, {x: 300}]
    },
    {
      board: 'board8',
      balls: [{x: 300}, {x: 100}, {x: 50}, {x: -250}]
    },
    {
      board: 'board10',
      balls: [{x: -230}, {x: -270}]
    },
    {
      board: 'board10',
      balls: [{x: -230}, {x: -270}, {x: 250}, {x: 250}, {x: 250}]
    }
  ],

  /**
   * Board layout definitions.
   * [0] {number} is x pixel position of center part of the stick, relative to board center.
   * [1] {number} is y pixel position of center part of the stick ignoring the hook, relative to board center.
   * [2] {number} is the full pixel width of the stick.
   * [3] {number} angle is the rotation of the stick in degrees around the center position of the stick.
   * [4] {boolean} mirrors the stick horizontally.
   */
  BOARDS: {
    // Straight path, zik zak from top to bottom.
    easy: {
      sticks: [
        [-125, -124, 500, 0, false],
        [125, 40, 500, 0, true],
        [-220, 166, 300, 12, false]
      ]
    },
    board2: {
      sticks: [
        [-260, -132, 250, 6, false],
        [228, -132, 300, 0, true],
        [-24, -28, 356, 180, true],
        [253, 65, 280, 186, true],
        [-226, 156, 300, 0, false]
      ]
    },
    board3: {
      sticks: [
        [-278, -127, 200, 12, false],
        [140, -85, 215, 0, false],
        [-125, -4, 195, 0, true],
        [310, 38, 190, 8, true],
        [-250, 100, 300, 180, true],
        [217, 134, 300, 180, false]
      ]
    },
    board4: {
      sticks: [
        [-215, -153, 284, 0, false],
        [239, -177, 340, 175, false],
        [-29, -90, 310, 180, false],
        [-285, -20, 260, 8, false],
        [222, 24, 150, 170, false],
        [-128, 80, 275, 0, true],
        [-250, 160, 350, 180, true],
        [250, 195, 310, 0, true]
      ]
    },
    board5: {
      sticks: [
        [-128, -144, 525, 177, true],
        [144, -62, 494, 180, false],
        [-255, -6, 320, 0, false],
        [-30, 90, 440, 177, true],
        [225, 167, 340, 180, true]
      ]
    },
    board6: {
      sticks: [
        [-227, -148, 285, 4, false],
        [280, -183, 252, 180, false],
        [83, -73, 490, 0, true],
        [-197, -6, 190, 180, false],
        [-96, 96, 624, 180, true],
        [227, 164, 360, 170, false]
      ]
    },
    board7: {
      sticks: [
        [-72, -193, 383, 180, false],
        [-10, -80, 498, 0, false],
        [-223, -15, 356, 180, false],
        [306, -2, 180, 170, false],
        [32, 100, 554, 0, true],
        [-238, 176, 360, 170, true]
      ]
    },
    board8: {
      sticks: [
        [300, -175, 226, 180, false],
        [-286, -90, 250, 8, false],
        [96, -83, 306, 180, false],
        [-128, 38, 210, 0, true],
        [-240, 138, 326, 180, true],
        [308, 58, 200, 0, true],
        [193, 142, 244, 166, false]
      ]
    },
    // Not used currently
    board9: {
      sticks: [
        [-216, -168, 296, 180, true],
        [238, -168, 320, 172, false],
        [-44, -54, 308, 180, false],
        [0, 67, 400, 0, false],
        [-230, 138, 300, 190, false],
        [240, 170, 300, 0, true]
      ]
    },
    board10: {
      sticks: [
        [-288, -146, 180, 0, false],
        [208, -142, 400, 6, true],
        [50, -48, 460, 190, false],
        [252, 124, 334, 180, true]
      ]
    },
    board11: {
      sticks: [
        [-288, -146, 180, 0, false],
        [208, -142, 400, 6, true],
        [50, -48, 460, 190, false],
        [-256, -16, 300, 180, false],
        [-124, 96, 298, 0, true],
        [-224, 162, 332, 180, false],
        [252, 124, 334, 180, true]
      ]
    },
    // Needs to make a jump.
    slideTight: {
      sticks: [
        [-250, -100, 300, 0, false], // Top left
        [0, 0, 450, 163, false], // Center
        [220, 150, 350, 163, false] // Bottom right
      ]
    }
  }
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
