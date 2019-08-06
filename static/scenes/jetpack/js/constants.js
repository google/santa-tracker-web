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
  INITIAL_COUNTDOWN: 60, // in seconds
  TOTAL_LEVELS: 10, // number of levels

  ITEM_SPAWN_INTERVAL: 2.0,
  ITEM_SPAWN_VARIANCE: 2.0,
  ITEM_SPAWN_MULTIPLY_EACH_LEVEL: 0.95,
  ITEM_SPEED_MULTIPLY_EACH_LEVEL: 1.15,

  CLOCK_SPAWN_INTERVAL: 10.0,
  CLOCK_SPAWN_VARIANCE: 2.0,
  CLOCK_SPAWN_MULTIPLY_EACH_LEVEL: 0.95,
  CLOCK_SPEED_MULTIPLY_EACH_LEVEL: 1.15,

  ITEM_SPEED_NORMAL: 75,
  ITEM_SPEED_FAST: 150,
  ITEM_SCORE_NORMAL: 50,
  ITEM_SCORE_FAST: 75,
  ITEM_TIME_NORMAL: 5.0,
  ITEM_TIME_FAST: 10.0,

  DANGER_LEVEL_START: 2,
  DANGER_SPEED_SCALE: 1.5,
  DANGER_SPAWN_INTERVAL: 10,
  DANGER_SPAWN_VARIANCE: 3,
  DANGER_SCORE_RETRACTION_FAST: -10,
  DANGER_SCORE_RETRACTION_SLOW: -5,

  ITEM_MIN_DISTANCE: 60, // pixels from player center to be considered caught

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  PLAYER_MAX_SPEED: 900, // pixels per second.
  PLAYER_ACCELERATION: 3, // Percent of max speed per second per second.

  PLAYER_MAX_ROTATION: 15, // in degrees
  PLAYER_MAX_FIRESCALE: 1.25, // in %
  PLAYER_HIT_DURATION: 1, // in seconds

  PLAYER_CENTER: 150,
  PLAYER_MIN_X: 225,
  PLAYER_MAX_X: 680,
  PLAYER_MIN_Y: 100,
  PLAYER_MAX_Y: 500,

  TOUCH_SENSITIVITY: 70, // Pixels dragged to reach max speed.

  SCENE_WIDTH: 980,
  SCENE_HEIGHT: 600,

  CLOUD_SPAWN_INTERVAL: 1.7,
  CLOUD_SPAWN_VARIANCE: 2.5,

  LEVEL_DURATION: 21, // in seconds
  GOAL_DURATION: 3.5, // in seconds

  TUTORIAL_LEFTRIGHT_TIMEOUT: 5000,
  TUTORIAL_UPDOWN_TIMEOUT: 3000,

  /**
   * All the different item types.
   *
   * Each item type has a css class for UI, a weight for the random item picker.
   * Some fall fast, others glide slowly.
   * @type {Array.<Constants.ItemType>}
   */
  ITEM_TYPES: [
    // Presents
    {css: 'item-present item-present--1', weight: 2.5, fast: false},
    {css: 'item-present item-present--2', weight: 2.5, fast: false},
    {css: 'item-present item-present--3', weight: 1.5, fast: true},
    {css: 'item-present item-present--4', weight: 2.5, fast: false},

    // Ball
    {css: 'item-ball item-ball--1', weight: 1, fast: true},
    {css: 'item-ball item-ball--2', weight: 1, fast: true},
    {css: 'item-ball item-ball--3', weight: 1, fast: true},
    {css: 'item-ball item-ball--4', weight: 1, fast: true},

    // Candy
    {css: 'item-candy item-candy--1', weight: 1, fast: true},
    {css: 'item-candy item-candy--2', weight: 1, fast: true},
    {css: 'item-candy item-candy--3', weight: 1, fast: true},
    {css: 'item-candy item-candy--4', weight: 1, fast: true}
  ],

  /**
   * All clock types.
   *
   * Each type has a css class for UI, a weight for the random item picker.
   * Some fall fast, others glide slowly.
   * @type {Array.<Constants.ClockType>}
   */
  CLOCK_TYPES: [
    {css: 'item-clock item-clock--1', weight: 2, fast: false},
    {css: 'item-clock item-clock--2', weight: 1, fast: true}
  ],

  /**
   * All danger types.
   *
   * Each type has a css class for UI, a weight for the random item picker.
   * Some fall fast, others glide slowly.
   * @type {Array.<Constants.DangerType>}
   */
  DANGER_TYPES: [
    {css: 'item-danger item-danger--1', weight: 1, fast: true},
    {css: 'item-danger item-danger--2', weight: 2, fast: false},
    {css: 'item-danger item-danger--3', weight: 1.5, fast: false},
    {css: 'item-danger item-danger--4', weight: 1.5, fast: false}
  ]
};


/**
 * Total weight of all danger items.
 * @type {number}
 * @const
 */
app.Constants.DANGER_WEIGHT = app.Constants.DANGER_TYPES.reduce(function(sum, type) {
  return sum + type.weight;
}, 0);


/**
 * Total weight of all score items.
 * @type {number}
 * @const
 */
app.Constants.ITEM_WEIGHT = app.Constants.ITEM_TYPES.reduce(function(sum, type) {
  return sum + type.weight;
}, 0);


/**
 * Total weight all of clocks.
 * @type {number}
 * @const
 */
app.Constants.CLOCK_WEIGHT = app.Constants.CLOCK_TYPES.reduce(function(sum, type) {
  return sum + type.weight;
}, 0);


/**
 * @typedef {{css: string, weight: number, speed: number, score: number}}
 */
app.Constants.ItemType;


/**
 * @typedef {{css: string, weight: number, fast: boolean}}
 */
app.Constants.ClockType;


/**
 * @typedef {{css: string, weight: number, fast: boolean}}
 */
app.Constants.DangerType;

Constants = app.Constants;
