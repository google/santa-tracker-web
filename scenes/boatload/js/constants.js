goog.provide('Constants');

/**
 * Gameplay constants
 * @const
 */
Constants = {
  // Countdown, in seconds
  INITIAL_COUNTDOWN: 60,
  TIME_PER_BOAT: 2,
  TOTAL_LEVELS: 10,

  // Scoring.
  SCORE_BOAT: 50,

  BOAT_START_SPEED: 50,
  BOAT_SPEED_PER_LEVEL: 10,
  BOAT_SPAWN_INTERVAL: 7.0,
  BOAT_SPAWN_VARIANCE: 2.0,
  BOAT_SPAWN_MULTIPLY_EACH_LEVEL: 1,
  BOAT_SPAWN_BASE: 0.5,
  BOAT_X: 850,
  BOAT_HEIGHT_SMALL: 246,
  BOAT_WIDTH_LARGE: 90,

  BUBBLE_SPAWN_INTERVAL: 0.13,
  BUBBLE_SPAWN_VARIANCE: 0.05,

  ICEBERG_START_SPEED: 60,
  ICEBERG_SPEED_PER_LEVEL: 5,
  ICEBERG_SPAWN_INTERVAL: 3.0,
  ICEBERG_SPAWN_VARIANCE: 2.0,
  ICEBERG_SPAWN_MULTIPLY_EACH_LEVEL: 1,
  ICEBERG_SPAWN_BASE: 0.5,
  ICEBERG_X: 500,
  ICEBERG_X_VARIANCE: 250,

  PRESENT_INITIAL_VELOCITY: 400,

  PRESENT_WIDTH: 20,
  PRESENT_START_X: 166,
  PRESENT_END_X: 830,

  TIME_BETWEEN_PRESENTS: 0.5,

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  // Seconds left when countdown starts flashing
  COUNTDOWN_FLASH: 10,

  // Pixels per second. To make instant, use big enough number :)
  PLAYER_MAX_SPEED: 750,
  PLAYER_CENTER: 79,

  // Duration in seconds.
  LEVEL_DURATION: 21,

  TUTORIAL_SPACE_TIMEOUT: 5000,
  TUTORIAL_ARROW_TIMEOUT: 3000,

  /**
   * All the different boats.
   *
   * Each item type has a css class for UI, size and speed.
   * Some fall fast, others glide slowly.
   * @type {Array.<Constants.BoatType>}
   */
  BOATS: [
    // Presents
    {css: 'boat--1', height: 195, width: 89, speed: 0.8, sound: 'bl_score_yellow' },
    {css: 'boat--2', height: 164, width: 81, speed: 1, sound: 'bl_score_red' },
    {css: 'boat--3', height: 173, width: 81, speed: 1.2, sound: 'bl_score_red' }
  ],

  /**
   * All the different icebergs.
   *
   * Each item type has a css class for UI, size and speed.
   * Some fall fast, others glide slowly.
   * @type {Array.<Constants.IcebergType>}
   */
  ICEBERGS: [
    // Presents
    {css: 'iceberg--1', height: 162, width: 98, speed: 0.9},
    {css: 'iceberg--2', height: 57, width: 49, speed: 1.4},
    {css: 'iceberg--3', height: 120, width: 111, speed: 0.8},
    {css: 'iceberg--4', height: 73, width: 64, speed: 1.3},
    {css: 'iceberg--5', height: 124, width: 95, speed: 1.1},
    {css: 'iceberg--6', height: 87, width: 84, speed: 1.3}
  ]
};

/**
 * @typedef {{css: string, height: number, width: number, speed: number}}
 */
Constants.BoatType;

/**
 * @typedef {{css: string, height: number, width: number, speed: number}}
 */
Constants.IcebergType;
