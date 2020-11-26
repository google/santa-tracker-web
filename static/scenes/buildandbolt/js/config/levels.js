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

goog.provide('Levels');

goog.require('Constants');

/**
 * Some documentation for each type of entity:
 *
 * PITS
 * Minimum dimensions -  3 x 3
 *
 * WALLS
 * Minimum dimensions - 2 x 4
 *
 * TABLES
 * tableType can be 1, 2, or 3
 */

Levels = [
  // LEVEL 1
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 12,
          y: 6
        }
      },
      {
        startPos: {
          x: 16,
          y: 6
        }
      }
    ],
    toyType: Constants.TOY_TYPES.CAR,
    toysCapacity: 1,
    entities: [
      // LEVEL 1 - WALLS
      {
        type: 'wall',
        config: {
          height: 4,
          width: 20,
          x: 0,
          y: 0,
        }
      },
      {
        type: 'wall',
        config: {
          height: 4,
          width: 20,
          x: 4,
          y: 12,
        }
      },

      // LEVEL 1 - TABLES
      {
        type: 'table',
        config: {
          x: 23,
          y: 4,
          tableType: 1,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 2,
          y: 9,
          tableType: 3,
          isSideView: false,
          part: 2
        }
      },

      // LEVEL 1 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 12,
          y: 9,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 14,
          y: 9,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },

      // LEVEL 1 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 0,
            y: 7
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 19,
            y: 4
          },
          movementLength: 7,
          stepSize: .05
        }
      },

      // LEVEL 1 - FENCES
      {
        type: 'fence',
        config: {
          x: 24,
          y: 10,
          cells: [
            [
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 6,
          y: 7,
          cells: [
            [
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
                right: true
              }
            ],
            [
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {},
              {},
              {},
              {
                right: true,
              }
            ],
          ],
        }
      },
    ]
  },

  // LEVEL 2
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 1,
          y: 7
        }
      },
      {
        startPos: {
          x: 1,
          y: 9
        }
      }
    ],
    toyType: Constants.TOY_TYPES.CAR,
    toysCapacity: 2,
    entities: [
      // LEVEL 2 - WALLS
      {
        type: 'wall',
        config: {
          height: 4,
          width: 23,
          x: 5,
          y: 0,
        }
      },
      {
        type: 'wall',
        config: {
          height: 4,
          width: 23,
          x: 5,
          y: 12,
        }
      },

      // LEVEL 2 - TABLES
      {
        type: 'table',
        config: {
          x: 13,
          y: 8,
          tableType: 1,
          isSideView: true,
          part: 1,
        }
      },
      {
        type: 'table',
        config: {
          x: 20,
          y: 5,
          tableType: 2,
          isSideView: true,
          part: 2
        }
      },

      // LEVEL 2 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 0,
          playerId: 'b',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 2,
          playerId: 'a',
          isSideView: true,
          isMiddle: false,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 12,
          playerId: 'b',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 14,
          playerId: 'a',
          isSideView: true,
          isMiddle: false,
          flipped: true
        }
      },

      // LEVEL 2 - ICE
      {
        type: 'ice',
        config: {
          height: 8,
          width: 4,
          x: 7,
          y: 4,
        }
      },
      {
        type: 'ice',
        config: {
          height: 8,
          width: 4,
          x: 14,
          y: 4,
        }
      },
      {
        type: 'ice',
        config: {
          height: 8,
          width: 4,
          x: 21,
          y: 4,
        }
      },

      // LEVEL 2 - PITS
      {
        type: 'pit',
        config: {
          height: 8,
          width: 3,
          x: 25,
          y: 4,
        }
      },


      // LEVEL 2 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 11,
            y: 4
          },
          movementLength: 7,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 18,
            y: 4
          },
          movementLength: 7,
          stepSize: .1
        }
      },
    ]
  },

  // LEVEL 3
  {
    time: 90,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 14,
          y: 1
        }
      },
      {
        startPos: {
          x: 14,
          y: 14
        }
      }
    ],
    toyType: Constants.TOY_TYPES.CAR,
    toysCapacity: 3,
    entities: [
      // LEVEL 3 - WALLS
      {
        type: 'wall',
        config: {
          height: 4,
          width: 6,
          x: 18,
          y: 2,
        }
      },
      {
        type: 'wall',
        config: {
          height: 4,
          width: 6,
          x: 4,
          y: 10,
        }
      },

      // LEVEL 3 - TABLES
      {
        type: 'table',
        config: {
          x: 5,
          y: 7,
          tableType: 3,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 20,
          y: 7,
          tableType: 2,
          isSideView: false,
          part: 2
        }
      },

      // LEVEL 3 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 5,
          playerId: 'b',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 7,
          playerId: 'a',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 9,
          playerId: 'b',
          isSideView: true,
          isMiddle: false,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 26,
          y: 5,
          playerId: 'a',
          isSideView: true,
          isMiddle: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 26,
          y: 7,
          playerId: 'b',
          isSideView: true,
          isMiddle: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 26,
          y: 9,
          playerId: 'a',
          isSideView: true,
          isMiddle: false
        }
      },


      // LEVEL 3 - PITS
      {
        type: 'pit',
        config: {
          height: 12,
          width: 8,
          x: 10,
          y: 2,
        }
      },


      // LEVEL 3 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 2,
            y: 14
          },
          movementLength: 7,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 18,
            y: 1
          },
          movementLength: 7,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 2,
            y: 2
          },
          movementLength: 7,
          stepSize: .07
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 18,
            y: 13
          },
          movementLength: 7,
          stepSize: .07
        }
      },

      // LEVEL 3 - PLATFORMS
      {
        type: 'platform',
        config: {
          isVertical: false,
          startPos: {
            x: 10,
            y: 7
          },
          height: 2,
          width: 2,
          movementLength: 6,
          stepSize: .04
        }
      },
    ]
  },

  // LEVEL 4
  {
    time: 90,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 20,
          y: 6
        }
      },
      {
        startPos: {
          x: 20,
          y: 9
        }
      }
    ],
    toyType: Constants.TOY_TYPES.TEDDY,
    toysCapacity: 3,
    entities: [
      // LEVEL 4 - WALLS
      {
        type: 'wall',
        config: {
          height: 4,
          width: 5,
          x: 12,
          y: 0,
        }
      },
      {
        type: 'wall',
        config: {
          height: 4,
          width: 5,
          x: 12,
          y: 12,
        }
      },

      // LEVEL 4 - TABLES
      {
        type: 'table',
        config: {
          x: 19,
          y: 1,
          tableType: 1,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 19,
          y: 13,
          tableType: 2,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'table',
        config: {
          x: 25,
          y: 6,
          tableType: 1,
          isSideView: true,
          part: 2
        }
      },

      // LEVEL 4 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 1,
          playerId: 'a',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 3,
          playerId: 'b',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 5,
          playerId: 'a',
          isSideView: true,
          isMiddle: false,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 9,
          playerId: 'b',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 11,
          playerId: 'a',
          isSideView: true,
          isMiddle: true,
          flipped: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 0,
          y: 13,
          playerId: 'b',
          isSideView: true,
          isMiddle: false,
          flipped: true
        }
      },

      // LEVEL 4 - PITS
      {
        type: 'pit',
        config: {
          height: 8,
          width: 3,
          x: 13,
          y: 4,
        }
      },

      // LEVEL 4 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 0,
            y: 7
          },
          movementLength: 12,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 0,
            y: 8
          },
          movementLength: 12,
          stepSize: .07
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 17,
            y: 3
          },
          movementLength: 9,
          stepSize: .07
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 24,
            y: 3
          },
          movementLength: 9,
          stepSize: .06
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 17,
            y: 12
          },
          movementLength: 7,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 17,
            y: 3
          },
          movementLength: 7,
          stepSize: .04
        }
      },


      // LEVEL 4 - PLATFORMS
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 13,
            y: 4
          },
          height: 4,
          width: 3,
          movementLength: 4,
          stepSize: .05
        }
      },

      // LEVEL 4 - FENCES
      {
        type: 'fence',
        config: {
          x: 5,
          y: 1,
          cells: [
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
            ],
            [
              {},
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {},
              {},
              {},
              {},
              {
                right: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 5,
          y: 10,
          cells: [
            [
              {},
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {},
              {},
              {},
              {},
              {
                right: true,
              }
            ],
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
                right: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
          ],
        }
      },
    ]
  },

  // LEVEL 5
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 25,
          y: 2
        }
      },
      {
        startPos: {
          x: 1,
          y: 13
        }
      }
    ],
    toyType: Constants.TOY_TYPES.CAR,
    toysCapacity: 3,
    entities: [
      // LEVEL 5 - WALLS
      {
        type: 'wall',
        config: {
          height: 8,
          width: 10,
          x: 9,
          y: 4,
        }
      },

      // LEVEL 5 - TABLES
      {
        type: 'table',
        config: {
          x: 5,
          y: 6,
          tableType: 3,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 20,
          y: 8,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },

      // LEVEL 5 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 10,
          y: 0,
          playerId: 'a',
          isSideView: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 13,
          y: 0,
          playerId: 'a',
          isSideView: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 16,
          y: 0,
          playerId: 'a',
          isSideView: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 10,
          y: 14,
          playerId: 'b',
          isSideView: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 13,
          y: 14,
          playerId: 'b',
          isSideView: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 16,
          y: 14,
          playerId: 'b',
          isSideView: false
        }
      },

      // LEVEL 5 - ICE
      {
        type: 'ice',
        config: {
          height: 16,
          width: 28,
          x: 0,
          y: 0,
        }
      },

      // LEVEL 5 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 4,
            y: 3
          },
          movementLength: 4,
          stepSize: .04
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 4,
            y: 12
          },
          movementLength: 4,
          stepSize: .06
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 19,
            y: 3
          },
          movementLength: 4,
          stepSize: .06
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 19,
            y: 12
          },
          movementLength: 4,
          stepSize: .04
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 0,
            y: 7
          },
          movementLength: 2,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 3,
            y: 6
          },
          movementLength: 3,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 25,
            y: 7
          },
          movementLength: 2,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 24,
            y: 6
          },
          movementLength: 3,
          stepSize: .05
        }
      },
    ]
  },

  // LEVEL 6
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 12,
          y: 7
        }
      },
      {
        startPos: {
          x: 16,
          y: 6
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROCKET,
    toysCapacity: 2,
    entities: [
      // LEVEL 6 - TABLES
      {
        type: 'table',
        config: {
          x: 10,
          y: 3,
          tableType: 1,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 16,
          y: 3,
          tableType: 2,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 10,
          y: 9,
          tableType: 2,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'table',
        config: {
          x: 16,
          y: 9,
          tableType: 3,
          isSideView: false,
          part: 4
        }
      },

      // LEVEL 6 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 2,
          y: 14,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 4,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 23,
          y: 14,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 25,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },

      // LEVEL 6 - ICE
      {
        type: 'ice',
        config: {
          height: 3,
          width: 8,
          x: 0,
          y: 0,
        }
      },
      {
        type: 'ice',
        config: {
          height: 3,
          width: 7,
          x: 21,
          y: 0,
        }
      },

      // LEVEL 6 - PITS
      {
        type: 'pit',
        config: {
          height: 9,
          width: 8,
          x: 0,
          y: 3,
        }
      },
      {
        type: 'pit',
        config: {
          height: 9,
          width: 7,
          x: 21,
          y: 3,
        }
      },
      {
        type: 'pit',
        config: {
          height: 4,
          width: 13,
          x: 8,
          y: 12,
        }
      },

      // LEVEL 6 - PENGUINS

      // LEVEL 6 - PLATFORMS
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 2,
            y: 3
          },
          height: 5,
          width: 3,
          movementLength: 4,
          stepSize: .03
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 23,
            y: 3
          },
          height: 5,
          width: 3,
          movementLength: 4,
          stepSize: .03
        }
      },
    ]
  },

  // LEVEL 7
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 25,
          y: 6
        }
      },
      {
        startPos: {
          x: 2,
          y: 6
        }
      },
    ],
    toyType: Constants.TOY_TYPES.TEDDY,
    toysCapacity: 3,
    entities: [
      // LEVEL 7 - TABLES
      {
        type: 'table',
        config: {
          x: 13,
          y: 13,
          tableType: 3,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 21,
          y: 5,
          tableType: 3,
          isSideView: true,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 6,
          y: 5,
          tableType: 1,
          isSideView: true,
          part: 3
        }
      },

      // LEVEL 7 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 3,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 5,
          y: 14,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 7,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 19,
          y: 14,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 21,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 23,
          y: 14,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },

      // LEVEL 7 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 1,
            y: 2
          },
          movementLength: 5,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 1,
            y: 8
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 14,
            y: 2
          },
          movementLength: 5,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 14,
            y: 8
          },
          movementLength: 4,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 2
          },
          movementLength: 5,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 8
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 6,
            y: 1
          },
          movementLength: 4,
          stepSize: .04
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 2,
            y: 12
          },
          movementLength: 4,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 20,
            y: 1
          },
          movementLength: 4,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 16,
            y: 12
          },
          movementLength: 4,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 4,
            y: 4
          },
          movementLength: 4,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 9,
            y: 4
          },
          movementLength: 4,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 4,
            y: 9
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 6,
            y: 3
          },
          movementLength: 4,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 19,
            y: 4
          },
          movementLength: 4,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 24,
            y: 4
          },
          movementLength: 4,
          stepSize: .03
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 19,
            y: 9
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 19,
            y: 3
          },
          movementLength: 4,
          stepSize: .03
        }
      },
    ]
  },

  // LEVEL 8
  {
    time: 90,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 2,
          y: 8
        }
      },
      {
        startPos: {
          x: 26,
          y: 8
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROBOT,
    toysCapacity: 2,
    entities: [
      // LEVEL 8 - TABLES
      {
        type: 'table',
        config: {
          x: 4,
          y: 0,
          tableType: 2,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 12,
          y: 6,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 21,
          y: 14,
          tableType: 3,
          isSideView: false,
          part: 3
        }
      },

      // LEVEL 8 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 20,
          y: 0,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 0,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 5,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 7,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },

      // LEVEL 8 - PITS
      {
        type: 'pit',
        config: {
          height: 3,
          width: 28,
          x: 0,
          y: 3,
        }
      },
      {
        type: 'pit',
        config: {
          height: 3,
          width: 28,
          x: 0,
          y: 10,
        }
      },

      // LEVEL 8 - PLATFORMS
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 4,
            y: 3
          },
          height: 2,
          width: 2,
          movementLength: 1,
          stepSize: .01
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 22,
            y: 10
          },
          height: 2,
          width: 2,
          movementLength: 1,
          stepSize: .01
        }
      },

      // LEVEL 8 - FENCES
      {
        type: 'fence',
        config: {
          x: 0,
          y: 2,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 0,
          y: 5,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 0,
          y: 9,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 24,
          y: 5,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 24,
          y: 9,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 24,
          y: 12,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              },
              {
                bottom: true,
              }
            ],
          ],
        }
      },
    ]
  },

  // LEVEL 9
  {
    time: 90,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 24,
          y: 6
        }
      },
      {
        startPos: {
          x: 24,
          y: 9
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROCKET,
    toysCapacity: 1,
    entities: [
      // LEVEL 9 - TABLES
      {
        type: 'table',
        config: {
          x: 4,
          y: 1,
          tableType: 1,
          isSideView: true,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 4,
          y: 12,
          tableType: 3,
          isSideView: true,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 24,
          y: 1,
          tableType: 3,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'table',
        config: {
          x: 24,
          y: 13,
          tableType: 1,
          isSideView: false,
          part: 4
        }
      },

      // LEVEL 9 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 26,
          y: 5,
          playerId: 'b',
          isSideView: true,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 26,
          y: 9,
          playerId: 'a',
          isSideView: true,
          isMiddle: false
        }
      },

      // LEVEL 9 - ICE
      {
        type: 'ice',
        config: {
          height: 6,
          width: 4,
          x: 6,
          y: 5,
        }
      },

      // LEVEL 9 - PITS
      {
        type: 'pit',
        config: {
          height: 16,
          width: 3,
          x: 0,
          y: 0,
        }
      },
      {
        type: 'pit',
        config: {
          height: 16,
          width: 12,
          x: 10,
          y: 0,
        }
      },

      // LEVEL 9 - PENGUINS
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 8,
            y: 3
          },
          movementLength: 9,
          stepSize: .05
        }
      },

      // LEVEL 9 - PLATFORMS
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 10,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .06
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 12,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .04
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 14,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .06
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 16,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .04
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 18,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .06
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 20,
            y: 2
          },
          height: 2,
          width: 2,
          movementLength: 10,
          stepSize: .04
        }
      },

      // LEVEL 9 - FENCES
      {
        type: 'fence',
        config: {
          x: 3,
          y: 0,
          cells: [
            // first line
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 3,
          y: 11,
          cells: [
            // first line
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 9,
          y: 0,
          cells: [
            // first line
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 9,
          y: 10,
          cells: [
            // first line
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
            [
              {
                right: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 26,
          y: 7,
          cells: [
            // first line
            [
              {
                bottom: true,
              },
              {
                bottom: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 22,
          y: 0,
          cells: [
            // first line
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 22,
          y: 12,
          cells: [
            // first line
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
            [
              {
                left: true,
              },
            ],
          ],
        }
      },
    ]
  },

  // LEVEL 10
  {
    time: 60,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 14,
          y: 2
        }
      },
      {
        startPos: {
          x: 12,
          y: 14
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROCKET,
    toysCapacity: 1,
    entities: [
      // LEVEL 10 - TABLES
      {
        type: 'table',
        config: {
          x: 1,
          y: 7,
          tableType: 2,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 24,
          y: 7,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 2,
          y: 1,
          tableType: 3,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'table',
        config: {
          x: 25,
          y: 12,
          tableType: 2,
          isSideView: true,
          part: 4
        }
      },

      // LEVEL 10 - PRESENT BOXES
      {
        type: 'present-box',
        config: {
          x: 12,
          y: 0,
          playerId: 'a',
          isSideView: false,
          isMiddle: false
        }
      },
      {
        type: 'present-box',
        config: {
          x: 14,
          y: 14,
          playerId: 'b',
          isSideView: false,
          isMiddle: false
        }
      },

      // LEVEL 10 - ICE
      {
        type: 'ice',
        config: {
          height: 5,
          width: 8,
          x: 0,
          y: 0,
        }
      },
      {
        type: 'ice',
        config: {
          height: 5,
          width: 8,
          x: 20,
          y: 11,
        }
      },
      {
        type: 'ice',
        config: {
          height: 6,
          width: 3,
          x: 5,
          y: 10,
        }
      },
      {
        type: 'ice',
        config: {
          height: 6,
          width: 3,
          x: 20,
          y: 0,
        }
      },
      {
        type: 'ice',
        config: {
          height: 3,
          width: 6,
          x: 11,
          y: 0,
        }
      },
      {
        type: 'ice',
        config: {
          height: 3,
          width: 6,
          x: 11,
          y: 13,
        }
      },

      // LEVEL 10 - PITS
      {
        type: 'pit',
        config: {
          height: 5,
          width: 5,
          x: 0,
          y: 11,
        }
      },
      {
        type: 'pit',
        config: {
          height: 5,
          width: 5,
          x: 23,
          y: 0,
        }
      },
      {
        type: 'pit',
        config: {
          height: 3,
          width: 12,
          x: 8,
          y: 3,
        }
      },
      {
        type: 'pit',
        config: {
          height: 3,
          width: 12,
          x: 8,
          y: 10,
        }
      },

      // LEVEL 10 - FENCES
      {
        type: 'fence',
        config: {
          x: 0,
          y: 5,
          cells: [
            [
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
            ],

          ],
        }
      },
      {
        type: 'fence',
        config: {
          x: 22,
          y: 11,
          cells: [
            [
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
              {
                top: true,
              },
            ],
          ],
        }
      },
    ]
  },

  // demo level
  // {
  //   time: 90,
  //   hurryUpMusicTime: 25,
  //   players: [
  //     {
  //       startPos: {
  //         x: 27,
  //         y: 0
  //       }
  //     },
  //     {
  //       startPos: {
  //         x: 0,
  //         y: 0
  //       }
  //     }
  //   ],
  //   toyType: Constants.TOY_TYPES.CAR,
  //   toysCapacity: 2,
  //   entities: [
  //     {
  //       type: 'pit',
  //       config: {
  //         height: 5,
  //         width: 6,
  //         x: 2,
  //         y: 1,
  //       }
  //     },
  //     {
  //       type: 'pit',
  //       config: {
  //         height: 5,
  //         width: 12,
  //         x: 5,
  //         y: 10,
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 5,
  //           y: 7
  //         },
  //         movementLength: 10,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: true,
  //         startPos: {
  //           x: 26,
  //           y: 4
  //         },
  //         movementLength: 5,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 3,
  //         width: 2,
  //         x: 10,
  //         y: 1,
  //       }
  //     },
  //     {
  //       type: 'fence',
  //       config: {
  //         x: 20,
  //         y: 1,
  //         cells: [
  //           // first line
  //           [
  //             {
  //               left: true,
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             }
  //           ],
  //           // second line
  //           [
  //             {
  //               left: true,
  //               // right: true,
  //             },
  //             {
  //               left: true,
  //               top: true,
  //             },
  //             {
  //               top: true,
  //               right: true,
  //             }
  //           ],
  //           [
  //             {
  //               left: true,
  //               bottom: true,
  //             },
  //             {
  //               bottom: true,
  //               right: true,
  //             }
  //           ],
  //         ],
  //       }
  //     },
  //     {
  //       type: 'table',
  //       config: {
  //         x: 1,
  //         y: 12,
  //         tableType: 1,
  //         isSideView: false,
  //         part: 1
  //       }
  //     },
  //     {
  //       type: 'table',
  //       config: {
  //         x: 13,
  //         y: 1,
  //         tableType: 2,
  //         isSideView: true,
  //         part: 2
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 22,
  //         y: 14,
  //         playerId: 'a',
  //         isSideView: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 22,
  //         y: 12,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 19,
  //         y: 12,
  //         playerId: 'a',
  //         isSideView: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 19,
  //         y: 10,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'platform',
  //       config: {
  //         isVertical: true,
  //         startPos: {
  //           x: 22,
  //           y: 4
  //         },
  //         height: 2,
  //         width: 3,
  //         movementLength: 5,
  //         stepSize: .07
  //       }
  //     },
  //     {
  //       type: 'ice',
  //       config: {
  //         height: 4,
  //         width: 7,
  //         x: 14,
  //         y: 5,
  //       }
  //     },
  //   ]
  // },
];
