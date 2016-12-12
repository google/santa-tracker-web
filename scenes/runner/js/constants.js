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
 * Constants for endless runner game.
 */
Constants = {
  INITIAL_COUNTDOWN: 120,

  COUNTDOWN_TRACK_LENGTH: 120, // in seconds
  // Seconds left when countdown starts flashing
  COUNTDOWN_FLASH: 10,

  GAME_BASE_SIZE: {
    width: 1410,
    height: 670
  },

  GAME_MAX_SCALE: 1,
  GAME_BASE_SPEED: 350,
  GAME_LEVEL_SPEED: [1, 1.3, 1.6, 1.9],
  GAME_ENTITY_SPACING: 500,
  FINISH_LINE_BUFFER: 1500,

  REINDEER_STATE_RUNNING: 0,
  REINDEER_STATE_SLIDING: 1,
  REINDEER_STATE_JUMPING: 2,
  REINDEER_STATE_COLLISION: 3,
  REINDEER_STATE_JUMP_START: 4,

  REINDEER_COLLISION_DURATION_SEC: 2,
  REINDEER_HIT_CLOUD_DURATION_SEC: .5,

  REINDEER_HIT_CLOUD_SIZE: 120,

  REINDEER_X_POS: 450,

  REINDEER_STATES: [
    {css: 'reindeer--run', xOffset: 95, yOffset: 0, width: 175, height: 170},
    {css: 'reindeer--slide', xOffset: 63, yOffset: 0, width: 200, height: 95},
    {css: 'reindeer--jump', xOffset: 70, yOffset: 30, width: 195, height: 115},
    {css: 'reindeer--collision', xOffset: 110, yOffset: 10, width: 120, height: 165},
    {css: 'reindeer--jump', xOffset: 70, yOffset: 30, width: 195, height: 115}
  ],

  REINDEER_FALL_SPEED: 200,
  REINDEER_JUMP_SPEED: -1100,
  REINDEER_JUMP_ACCELERATION_STEP: -28,
  REINDEER_GRAVITY: 2400,
  REINDEER_COLLISION_X_SPEED: -200,
  REINDEER_COLLISION_Y_SPEED: -500,
  REINDEER_COLLISION_X_FRICTION: 250,
  REINDEER_COLLISION_X_RECOVERY_SPEED: 100,
  REINDEER_FINISH_Y_SPEED: -1750,

  REINDEER_MAGNET_STRENGTH: 500,
  MAGNET_DURATION_SEC: 20,
  MAGNET_ANIMATION_DURATION_SEC: 0.5,

  PLATFORM_HEIGHT: 270,
  PX_BETWEEN_OBSTACLES: 1000,
  PX_BETWEEN_BOOSTS: 2000,

  OBSTACLES_GROUND: [
    {css: 'house--1', width: 400, height: 165},
    {css: 'house--2', width: 400, height: 150},
    {css: 'house--3', width: 400, height: 165},
    {css: 'house--4', width: 400, height: 180},
    {css: 'house--5', width: 400, height: 160},
    {css: 'house--6', width: 400, height: 150},
    {css: 'house--7', width: 400, height: 160},
    {css: 'house--8', width: 400, height: 165},
    {css: 'house--9', width: 400, height: 160},
    {css: 'house--10', width: 400, height: 165},
    {css: 'tree-short--1', width: 140, height: 140, hitBottom: 0},
    {css: 'tree-short--2', width: 140, height: 160, hitBottom: 0},
    {css: 'tree-tall--1', width: 230, height: 350, hitBottom: 100, presentsHeight: 50},
    {css: 'tree-tall--1', width: 186, height: 350, hitBottom: 100, presentsHeight: 50},
    // TODO: a temperary fix to increase chance of trees
    {css: 'tree-short--1', width: 140, height: 140, hitBottom: 0},
    {css: 'tree-short--2', width: 140, height: 160, hitBottom: 0},
    {css: 'tree-tall--1', width: 230, height: 350, hitBottom: 100, presentsHeight: 50},
    {css: 'tree-tall--1', width: 186, height: 350, hitBottom: 100, presentsHeight: 50},
    {css: 'trashcan', hitCss: 'trashcan--hit', width: 90, height: 128, hitBottom: 0, hitWidth: 208}
  ],

  OBSTACLES_PLATFORM: [
    {css: 'antenna', width: 88, height: 112},
    {css: 'chimney--1', width: 72, height: 112},
    {css: 'chimney--2', width: 56, height: 112},
    {css: 'watertower', width: 65, height: 112}
  ],

  PLATFORMS_SHORT: [
    {css: 'platform-short--1', width: 392, height: 270},
    {css: 'platform-short--2', width: 392, height: 270},
    {css: 'platform-short--3', width: 392, height: 270},
    {css: 'platform-short--4', width: 392, height: 270},
    {css: 'platform-short--5', width: 392, height: 270}
  ],

  PLATFORMS_TALL: [
    {css: 'platform-tall--1', width: 392, height: 538},
    {css: 'platform-tall--2', width: 392, height: 538},
    {css: 'platform-tall--3', width: 392, height: 538},
    {css: 'platform-tall--4', width: 392, height: 538}
  ],

  FINISH: {width: 300, height: 265},

  PRESENTS: [
    {css: 'present--1', width: 30, height: 34, score: 100},
    {css: 'present--2', width: 22, height: 25, score: 100}
  ],

  TREATS: [
    {css: 'carrot', width: 64, height: 56, score: 300},
    {css: 'candy', width: 56, height: 34, score: 300}
  ],

  BOOST_TYPE_TIME: 0,
  BOOST_TYPE_MAGNET: 1,

  BOOSTS: [
    {css: 'boost--time', boostType: 0, text: '+00:10'},
    {css: 'boost--magnet', boostType: 1},
  ],

  BOOST_SIZE: 60
};
