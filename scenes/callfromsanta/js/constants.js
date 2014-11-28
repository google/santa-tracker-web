goog.provide('app.Constants');
goog.provide('Constants');

/**
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  INITIAL_COUNTDOWN: 60, // in seconds

  COUNTDOWN_TRACK_LENGTH: 60, // in seconds
  COUNTDOWN_TRACK_MAX_X: 150, // pixels
  COUNTDOWN_FLASH: 10, // seconds left when countdown starts flashing

  EVENT_ORIGIN: 'localhost',

  CLASS_PAUSED: 'paused',

  VARITALK_URL: '//www.sendacallfromsanta.com'
};

Constants = app.Constants;
