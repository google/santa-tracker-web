goog.provide('Constants');

/**
 * Constants for present havoc game.
 */
Constants = {
  // Configs for keyboard controls
  PLAYER_CONTROLS: {
    ARROWS: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    },
    WASD: {
      up: 'w',
      down: 's',
      left: 'a',
      right: 'd'
    }
  },
  PLAYER_STEP_SIZE: 2,

  GRID_DIMENSIONS: {
    HEIGHT: 16.0, // height in grid units
    WIDTH: 28.0, // width in grid units
    UNIT_SIZE: 50 // height and width of one grid unit
  }

}
