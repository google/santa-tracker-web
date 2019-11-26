goog.provide('Constants');

/**
 * Constants for present havoc game.
 */
Constants = {
  DEBUG: true,

  PLAYER_OPTIONS: {
    SINGLE: 'single',
    MULTIPLAYER: 'multiplayer'
  },

  // Configs for keyboard controls
  PLAYER_CONTROLS: {
    ARROWS: {
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      action: ['ShiftRight']
    },
    WASD: {
      up: ['KeyW'],
      down: ['KeyS'],
      left: ['KeyA'],
      right: ['KeyD'],
      action: ['ShiftLeft']
    },
    SINGLE: {
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'],
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      action: ['ShiftRight', 'ShiftLeft']
    }
  },
  PLAYER_STEP_SIZE: .1,
  PLAYER_ACCELERATION_STEP: .01,
  PLAYER_MAX_VELOCITY: .2,

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

  WALL_EXTRA_SPACE: 0.1,

  FENCE_THICKNESS: 2,

  TABLE_HEIGHT: 2,
  TABLE_WIDTH: 3,

  PRESENT_HEIGHT: 2,
  PRESENT_WIDTH: 2,

  PENGUIN_HEIGHT: 1,
  PENGUIN_WIDTH: 1,

}
