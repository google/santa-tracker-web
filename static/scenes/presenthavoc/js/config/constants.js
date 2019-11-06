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
  PLAYER_STEP_SIZE: .1,

  // Actions as a result of hitting other entities on the board
  PLAYER_ACTIONS: {
    RESTART: 'restart',
    STICK_TO_PLATFORM: 'stick',
    BOUNCE: 'bounce',
    BLOCK: 'block',
    DROP_ITEM: 'drop',
    ADD_TOY_PART: 'addtoy',
    ACCEPT_TOY: 'accept',
    SLIDE: 'slide'
  },

  GRID_DIMENSIONS: {
    HEIGHT: 16.0, // height in grid units
    WIDTH: 28.0, // width in grid units
    UNIT_SIZE: 50 // height and width of one grid unit
  },

  FENCE_THICKNESS: 9,

  TABLE_HEIGHT: 2,
  TABLE_WIDTH: 3,

  PRESENT_HEIGHT: 2,
  PRESENT_WIDTH: 2,

}
