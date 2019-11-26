goog.provide('Constants');

/**
 * Constants for present havoc game.
 */
Constants = {
  DEBUG: false,

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
  PLAYER_ACCELERATION_STEP: .0005,
  PLAYER_MAX_VELOCITY: .01,

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

  PLAYER_STATES: {
    REST: 0,
    WALK: 1,
    HOLD_REST: 2,
    HOLD_WALK: 3
  },

  PLAYER_FRAMES: {
    REST: {
      start: 1,
      end: 1,
      loop: true
    },
    REST_TO_WALK: {
      start: 1,
      end: 8
    },
    WALK: {
      start: 8,
      end: 24,
      loop: true
    },
    WALK_TO_REST: {
      start: 24,
      end: 32
    },
    REST_TO_HOLD_WALK: {
      start: 40,
      end: 48
    },
    HOLD_WALK: {
      start: 48,
      end: 64,
      loop: true
    },
    HOLD_WALK_TO_HOLD_REST: {
      start: 64,
      end: 72
    },
    HOLD_REST: {
      start: 72,
      end: 72,
      loop: true
    },
    HOLD_REST_TO_REST: {
      start: 72,
      end: 80
    }
  },

  GRID_DIMENSIONS: {
    HEIGHT: 16.0, // height in grid units
    WIDTH: 28.0, // width in grid units
    UNIT_SIZE: 50 // height and width of one grid unit
  },

  FENCE_THICKNESS: 2,

  TABLE_HEIGHT: 2,
  TABLE_WIDTH: 3,

  PRESENT_HEIGHT: 2,
  PRESENT_WIDTH: 2,

  PENGUIN_HEIGHT: 1,
  PENGUIN_WIDTH: 1,

}
