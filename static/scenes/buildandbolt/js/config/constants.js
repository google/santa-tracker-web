/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('Constants');

/**
 * Constants for present havoc game.
 */
Constants = {
  INITIAL_COUNTDOWN: 0,
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
  PLAYER_ACCELERATION_FACTOR: 1,
  PLAYER_DECELERATION_FACTOR: 1,
  PLAYER_ICE_ACCELERATION_FACTOR: 2,
  PLAYER_ICE_DECELERATION_FACTOR: .5,
  PLAYER_PUSH_FORCE: 0.01,
  PLAYER_BOUNCE_FORCE: 0.005,
  PLAYER_DIRECTION_CHANGE_THRESHOLD: 0.05,

  // Actions as a result of hitting other entities on the board
  PLAYER_ACTIONS: {
    STICK_TO_PLATFORM: 'stick',
    BOUNCE: 'bounce',
    BLOCK: 'block',
    DROP_ITEM: 'drop',
    ADD_TOY_PART: 'addtoy',
    ACCEPT_TOY: 'accept',
    SLIDE: 'slide',
    PIT_FALL: 'pitfall'
  },

  PLAYER_STATES: {
    REST: 0,
    WALK: 1,
    PICK_UP: 2,
    DROP_OFF: 3
  },

  PLAYER_FRAMES: {
    REST: {
      start: 1,
      end: 1,
      loop: true,
      fps: 60
    },
    REST_TO_WALK: {
      start: 1,
      end: 8,
      fps: 60
    },
    WALK: {
      start: 8,
      end: 24,
      loop: true,
      fps: 60
    },
    WALK_TO_REST: {
      start: 24,
      end: 32,
      fps: 60
    },
    REST_TO_HOLD_REST: {
      start: 32,
      end: 40,
      fps: 60
    },
    HOLD_REST_TO_HOLD_WALK: {
      start: 40,
      end: 48,
      fps: 60
    },
    HOLD_WALK: {
      start: 48,
      end: 64,
      loop: true,
      fps: 60
    },
    HOLD_WALK_TO_HOLD_REST: {
      start: 64,
      end: 72,
      fps: 60
    },
    HOLD_REST: {
      start: 72,
      end: 72,
      loop: true,
      fps: 60
    },
    HOLD_REST_TO_REST: {
      start: 72,
      end: 80,
      fps: 60
    },
  },

  BOARD_PADDING_TOP: 95,
  BOARD_PADDING_TOP_MOBILE: 35,
  BOARD_PADDING_LEFT_PERCENTAGE: 3,

  GRID_DIMENSIONS: {
    HEIGHT: 16, // height in grid units
    WIDTH: 28, // width in grid units
    UNIT_SIZE: 50 // height and width of one grid unit
  },

  WALL_EXTRA_SPACE: 0.15,

  FENCE_THICKNESS: 2,

  TABLE_HEIGHT: 2,
  TABLE_WIDTH: 3,

  PRESENT_HEIGHT: 2,
  PRESENT_WIDTH: 2,

  PENGUIN_HEIGHT: 1,
  PENGUIN_WIDTH: 1,

  PENGUIN_FRAMES: {
    start: 0,
    end: 12,
    loop: true,
    fps: 24
  },

  TOY_TYPES: {
    CAR: {
      key: 'car',
      size: 2
    },
    ROBOT: {
      key: 'robot',
      size: 3
    },
    ROCKET: {
      key: 'rocket',
      size: 4
    },
    TEDDY: {
      key: 'teddy',
      size: 3
    }
  },

  LEVEL_TRANSITION_TIMING: 500, // from static/scenes/_shared/sass/_levelup.scss

  ZOOM_TOUCH_DEVICE: 0.25,

};
