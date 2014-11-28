goog.provide('Constants');
goog.provide('app.Constants');

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  FIRST_LEVEL_VISIBLE_COUNTRIES: 3,
  VISIBLE_COUNTRIES: 6,
  MAP_BORDER: 10, // % width of border where countries should not be placed
  TOTAL_LEVELS: 10, // Number of levels

  HITBOX_SIZE: 20, // px border around country

  INITIAL_COUNTDOWN: 40, // seconds
  TIME_PER_LEVEL: 40, // seconds
  LESS_TIME_PER_CYCLE: 5, // seconds

  SCORE_PER_COUNTRY: 100, // points
  // Multiply score if match is under x seconds from level start
  // Should be ordered from lowest to highest number of seconds
  SCORE_MULTIPLIERS: [
    [3, 2.5],
    [6, 2],
    [9, 1.5]
  ],

  COUNTDOWN_TRACK_LENGTH: 60, // seconds
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  COUNTRY_COLORS: [
    '#1875D1',
    '#AA46BB',
    '#28B5F5',
    '#BFC932',
    '#FB8B00',
    '#EB3F79'
  ],
  COUNTRY_MATCH_TEMPLATE: '<div class="country-match">' +
      '<div class="country-match-bg"></div>' +
      '<div class="country-match-text"></div>' +
    '</div>'
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
