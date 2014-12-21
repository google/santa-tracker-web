goog.provide('Constants');
goog.provide('app.Constants');


/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  LEVEL_COUNT: 5,
  INITIAL_COUNTDOWN: 60, // in seconds
  TIME_PER_LEVEL: 20,

  COUNTDOWN_TRACK_LENGTH: 90, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  PRESENT_SCORE: 10,

  COLORS: ['red', 'green', 'blue', 'pink', 'cyan'],
  NUMBERS: [1, 2, 3, 4, 5],

  PRESENTS_PER_LEVEL: [2, 4, 8, 16, 50],
  BELT_SPEED_PER_LEVEL: [0, 32, 50, 64, 96],
  BELT_CYCLE_DISTANCE: 240 * 5,

  PRESENT_SPAWN_WIDTH: 152,
  PRESENT_WIDTH: 130,
  MATCH_TIME: 3,
  MISS_TIME: -6
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
