goog.provide('Constants');
goog.provide('app.Constants');

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  BLOCK_X_COORDINATE: 20,
  BLOCK_Y_COORDINATE: 24,
  BLOCK_Y_COORDINATE_INTERVAL: 170,

  LEVEL_USABLE_ROWS: 12,
  LEVEL_USABLE_MAX_COLS: 7,
  LEVEL_USABLE_MIN_COLS: 5,

  BLOCKLY_MIN_WIDTH: 220,
  EDGE_MIN_WIDTH: 48,
  SCENE_TOGGLE_DURATION: 300,
  SCENE_TOGGLE_MIN_DRAG: 20
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
