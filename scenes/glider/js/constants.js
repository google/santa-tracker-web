goog.provide('Constants');

/**
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
Constants = {
  INITIAL_COUNTDOWN: 60, // in seconds
  TOTAL_LEVELS: 10, // number of levels
  COUNTDOWN_FLASH: 10,

  BASE_FONT_SIZE: 10,
  MAX_SCALE: 1.25,

  TOTAL_BUILDINGS: 26,
  BUILDING_START_SPEED: 13,
  BUILDING_SPEED_PER_LEVEL: 5,
  BUILDING_SPAWN_INTERVAL: 2.7,
  BUILDING_SPAWN_VARIANCE: 1,
  BUILDING_SPAWN_MULTIPLY_EACH_LEVEL: 0.7,
  BUILDING_SPAWN_BASE: 0.5,

  ITEM_SPAWN_INTERVAL: 7.0,
  ITEM_SPAWN_VARIANCE: 2.0,
  ITEM_SPAWN_MULTIPLY_EACH_LEVEL: 0.95,
  ITEM_SPEED_MULTIPLY_EACH_LEVEL: 1.15,

  ITEM_SPEED_NORMAL: 7.5,
  ITEM_SPEED_FAST: 15,
  ITEM_SCORE_NORMAL: 50,
  ITEM_SCORE_FAST: 75,
  ITEM_TIME_NORMAL: 1.0,
  ITEM_TIME_FAST: 2.0,

  OBSTACLE_SPAWN_INTERVAL: 7.0,
  OBSTACLE_SPAWN_VARIANCE: 2.0,
  OBSTACLE_SPAWN_MULTIPLY_EACH_LEVEL: 0.95,
  OBSTACLE_SPEED_MULTIPLY_EACH_LEVEL: 1.25,

  OBSTACLE_SPEED_NORMAL: 75,
  OBSTACLE_SPEED_FAST: 150,

  PLAYER: {
    width: 10,
    height: 4
  },

  PLAYER_MAX_SPEED: 90, // pixels per second.
  PLAYER_ACCELERATION: 3, // Percent of max speed per second per second.

  PLAYER_MAX_ROTATION: 25, // in degrees

  PLAYER_PULSE_TIME: 3, // in seconds

  PLAYER_PRESENT_X: 9,
  PLAYER_PRESENT_Y: 8.5,

  TOTAL_PRESENTS: 8,

  PRESENT_INITIAL_VELOCITY: 0,
  PRESENT_GRAVITY: 200,

  PRESENT: {
    width: 2.5,
    height: 2.5
  },

  TIME_BETWEEN_PRESENTS: 0.5,

  CLOUD_SPAWN_INTERVAL: 4.5,
  CLOUD_SPAWN_VARIANCE: 2.5,

  LEVEL_DURATION: 14, // in seconds,

  BUILDINGS: [
    { // 1
      width: 26, height: 12, originalwidth: 13.9,
      xgap: 3, ygap: 5,
      chimneys: [
        { type: 100, xpos: 22.9, ypos: 0.1 }
      ]
    },
    { // 2
      width: 21, height: 12, originalwidth: 26.5,
      xgap: 3, ygap: 5,
      chimneys: [
        { type: 200, xpos: 18.8, ypos: 0.5 }
      ]
    },
    { // 3
      width: 25, height: 12, originalwidth: 31.6,
      xgap: 3, ygap: 4,
      chimneys: [
        { type: 100, xpos: 18.7, ypos: 0.2 }
      ]
    },
    { // 4
      width: 27, height: 11, originalwidth: 32.9,
      xgap: 3, ygap: 6,
      chimneys: [
        { type: 200, xpos: 3.5, ypos: 1.2 }
      ]
    },
    { // 5
      width: 24, height: 20, originalwidth: 31.8,
      xgap: 4, ygap: 2,
      chimneys: [
        { type: 100, xpos: 4, ypos: 0.1 }
      ]
    },
    { // 6
      width: 24, height: 9, originalwidth: 31.6,
      xgap: 4, ygap: 7,
      chimneys: [
        { type: 100, xpos: 5.4, ypos: 0.2 }
      ]
    },
    { // 7
      width: 24, height: 9, originalwidth: 32,
      xgap: 4, ygap: 6,
      chimneys: [
        { type: 300, xpos: 4.5, ypos: 0.2 }
      ]
    },
    { // 8
      width: 26, height: 14, originalwidth: 32.2,
      xgap: 3, ygap: 7,
      chimneys: [
        { type: 100, xpos: 4.1, ypos: 0.1 }
      ]
    },
    { // 9
      width: 24, height: 13, originalwidth: 31.9,
      xgap: 4, ygap: 5,
      chimneys: [
        { type: 300, xpos: 6.3, ypos: 2.2 },
        { type: 200, xpos: 21.8, ypos: 0.2 }
      ]
    },
    { // 10
      width: 25, height: 34, originalwidth: 31.8,
      xgap: 3, ygap: 9,
      chimneys: [
        { type: 200, xpos: 13.8, ypos: 2.5 },
        { type: 300, xpos: 25, ypos: 0.1 }
      ]
    },
    { // 11
      width: 27, height: 15, originalwidth: 34.5,
      xgap: 4, ygap: 10,
      chimneys: [
        { type: 300, xpos: 7.1, ypos: 3.5 },
        { type: 200, xpos: 23.8, ypos: 0 }
      ]
    },
    { // 12
      width: 25, height: 9, originalwidth: 32.4,
      xgap: 4, ygap: 10,
      chimneys: [
        { type: 100, xpos: 13.7, ypos: 0.1 }
      ]
    },
    { // 13
      width: 27, height: 10, originalwidth: 33,
      xgap: 3, ygap: 6,
      chimneys: [
        { type: 200, xpos: 3.7, ypos: 0.7 }
      ]
    },
    { // 14
      width: 25, height: 45, originalwidth: 31.7,
      xgap: 3, ygap: 8,
      chimneys: [
        { type: 200, xpos: 4.9, ypos: 1.8 },
        { type: 300, xpos: 19.4, ypos: 0.2 },
        { type: 300, xpos: 25, ypos: 0.2 }
      ]
    },
    { // 15
      width: 26, height: 16, originalwidth: 31.8,
      xgap: 3, ygap: 5,
      chimneys: [
        { type: 200, xpos: 7.8, ypos: 0.1 }
      ]
    },
    { // 16
      width: 26, height: 13, originalwidth: 32.7,
      xgap: 3, ygap: 5,
      chimneys: [
        { type: 100, xpos: 13.6, ypos: 0.1 }
      ]
    },
    { // 17
      width: 25, height: 34, originalwidth: 31.5,
      xgap: 3, ygap: 14,
      chimneys: [
        { type: 300, xpos: 16.6, ypos: 10.2 },
        { type: 200, xpos: 23, ypos: 8.8 }
      ]
    },
    { // 18
      width: 26, height: 9, originalwidth: 31.9,
      xgap: 3, ygap: 7,
      chimneys: [
        { type: 100, xpos: 23, ypos: 0.2 }
      ]
    },
    { // 19
      width: 26, height: 9, originalwidth: 32.3,
      xgap: 3, ygap: 6,
      chimneys: [
        { type: 300, xpos: 25, ypos: 1 }
      ]
    },
    { // 20
      width: 26, height: 4, originalwidth: 32,
      xgap: 3, ygap: 7,
      chimneys: [
        { type: 100, xpos: 23, ypos: 0.2 }
      ]
    },
    { // 21
      width: 25, height: 34, originalwidth: 31.2,
      xgap: 3, ygap: 7,
      chimneys: [
        { type: 200, xpos: 3.8, ypos: 0.2 },
        { type: 200, xpos: 10.1, ypos: 0.2 },
        { type: 300, xpos: 16.4, ypos: 4 }
      ]
    },
    { // 22
      width: 26, height: 12, originalwidth: 32.3,
      xgap: 3, ygap: 6,
      chimneys: [
        { type: 200, xpos: 10.2, ypos: 0.1 }
      ]
    },
    { // 23
      width: 26, height: 9, originalwidth: 32.3,
      xgap: 3, ygap: 6,
      chimneys: [
        { type: 100, xpos: 23.3, ypos: 1.1 }
      ]
    },
    { // 24
      width: 26, height: 16, originalwidth: 32,
      xgap: 3, ygap: 8,
      chimneys: [
        { type: 100, xpos: 22.2, ypos: 0.2 }
      ]
    },
    { width: 9, height: 32, originalwidth: 16.7, xgap: 4, ygap: 0, chimneys: [] },  // 25
    { width: 7, height: 26, originalwidth: 16.6, xgap: 5, ygap: 0, chimneys: [] }  // 26
  ],

  CHIMNEY_TYPES: {
    '100': { width: 5 },
    '200': { width: 4 },
    '300': { width: 3 }
  },

  OBSTACLE_TYPES: [
    {
      css: 'animated balloon',
      points: 100,
      presents: 10,
      yVariance: 20,
      fast: false,
      width: 5,
      height: 8,
      xgap: 2,
      ygap: 0
    },
    {
      css: 'beam',
      points: 500,
      presents: 30,
      yVariance: 20,
      fast: true,
      width: 7,
      height: 63,
      xgap: 2,
      ygap: 0,
      margintop: -63
    },
    {
      css: 'box',
      points: 600,
      presents: 30,
      yVariance: 20,
      fast: false,
      width: 7,
      height: 75.5,
      xgap: 2,
      ygap: 0,
      margintop: -75.5
    },
    {
      css: 'animated bird',
      points: 100,
      presents: 10,
      yVariance: 20,
      fast: false,
      width: 9,
      height: 5,
      xgap: 0,
      ygap: 3
    },
    {
      css: 'animated frisbee',
      points: 200,
      presents: 20,
      yVariance: 30,
      fast: true,
      width: 9,
      height: 4,
      xgap: 0,
      ygap: 0
    }
  ],

  ITEM_TYPES: [
    {css: 'candy', weight: 6, fast: false, score: 200, time: 0, width: 6, height: 6, xgap: 0, ygap: 0 },
    {css: 'time', weight: 4, fast: true, score: 0, time: 5, width: 6, height: 6, xgap: 0, ygap: 0 }
  ]
};
