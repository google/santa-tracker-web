goog.provide('app.Constants');


/**
 * Shared game constants
 */
app.Constants = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 1400,
  CLOTH_HEIGHT: 25,
  CLOTH_WIDTH: 22,
  START_Y: 670,
  SPACING: 20,

  // Physics constants for cloth simulation
  TIME_STEP: 16,
  PHYSICS_DELTA: 0.032 * 0.032,
  PHYSICS_ACCURACY: 3,
  MOUSE_INFLUENCE: 20,
  MOUSE_CUT: 20,
  GRAVITY: 2000,

  TEAR_DISTANCE: 80,
  ADD_DISTANCE: 100,
  DAMPING: 0.8,
  HAIRDRYER_FORCE: 5500,

  // Serialization constants
  ENCODER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
};
