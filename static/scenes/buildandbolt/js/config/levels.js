goog.provide('Levels')

goog.require('Constants')

/**
 * Some documentation for each type of entity:
 *
 * PITS
 * Minimum dimensions -  3 x 3
 *
 * WALLS
 * Minimum dimensions - 2 x 4
 * Width must be even
 *
 * TABLES
 * tableType can be 1, 2, or 3
 */

Levels = [
  // LEVEL 1
  // {
  //   time: 90,
  //   hurryUpMusicTime: 25,
  //   players: [
  //     {
  //       startPos: {
  //         x: 12,
  //         y: 6
  //       }
  //     },
  //     {
  //       startPos: {
  //         x: 16,
  //         y: 6
  //       }
  //     }
  //   ],
  //   toyType: Constants.TOY_TYPES.CAR,
  //   toysCapacity: 1,
  //   entities: [
  //     // LEVEL 1 - WALLS
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 20,
  //         x: 0,
  //         y: 0,
  //       }
  //     },
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 20,
  //         x: 4,
  //         y: 12,
  //       }
  //     },

  //     // LEVEL 1 - TABLES
  //     {
  //       type: 'table',
  //       config: {
  //         x: 23,
  //         y: 4,
  //         tableType: 1,
  //         isSideView: false,
  //         part: 1
  //       }
  //     },
  //     {
  //       type: 'table',
  //       config: {
  //         x: 2,
  //         y: 9,
  //         tableType: 3,
  //         isSideView: false,
  //         part: 2
  //       }
  //     },

  //     // LEVEL 1 - PRESENT BOXES
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 12,
  //         y: 9,
  //         playerId: 'b',
  //         isSideView: false,
  //         isMiddle: false
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 14,
  //         y: 9,
  //         playerId: 'a',
  //         isSideView: false,
  //         isMiddle: false
  //       }
  //     },

  //     // LEVEL 1 - PENGUINS
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 0,
  //           y: 7
  //         },
  //         movementLength: 5,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: true,
  //         startPos: {
  //           x: 19,
  //           y: 4
  //         },
  //         movementLength: 7,
  //         stepSize: .05
  //       }
  //     },

  //     // LEVEL 1 - FENCES
  //     {
  //       type: 'fence',
  //       config: {
  //         x: 24,
  //         y: 10,
  //         cells: [
  //           [
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             }
  //           ],
  //         ],
  //       }
  //     },
  //     {
  //       type: 'fence',
  //       config: {
  //         x: 6,
  //         y: 7,
  //         cells: [
  //           [
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //             },
  //             {
  //               top: true,
  //               right: true
  //             }
  //           ],
  //           [
  //             {},
  //             {},
  //             {},
  //             {
  //               right: true,
  //             }
  //           ],
  //           [
  //             {},
  //             {},
  //             {},
  //             {
  //               right: true,
  //             }
  //           ],
  //           [
  //             {},
  //             {},
  //             {},
  //             {
  //               right: true,
  //             }
  //           ],
  //           [
  //             {},
  //             {},
  //             {},
  //             {
  //               right: true,
  //             }
  //           ],
  //         ],
  //       }
  //     },
  //   ]
  // },


  // LEVEL 2
  // {
  //   time: 90,
  //   hurryUpMusicTime: 25,
  //   players: [
  //     {
  //       startPos: {
  //         x: 1,
  //         y: 7
  //       }
  //     },
  //     {
  //       startPos: {
  //         x: 1,
  //         y: 9
  //       }
  //     }
  //   ],
  //   toyType: Constants.TOY_TYPES.CAR,
  //   toysCapacity: 2,
  //   entities: [
  //     // LEVEL 2 - WALLS
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 23,
  //         x: 5,
  //         y: 0,
  //       }
  //     },
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 23,
  //         x: 5,
  //         y: 12,
  //       }
  //     },

  //     // LEVEL 2 - TABLES
  //     {
  //       type: 'table',
  //       config: {
  //         x: 13,
  //         y: 8,
  //         tableType: 1,
  //         isSideView: true,
  //         part: 1
  //       }
  //     },
  //     {
  //       type: 'table',
  //       config: {
  //         x: 20,
  //         y: 5,
  //         tableType: 2,
  //         isSideView: true,
  //         part: 2
  //       }
  //     },

  //     // LEVEL 2 - PRESENT BOXES
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 0,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 2,
  //         playerId: 'a',
  //         isSideView: true,
  //         isMiddle: false
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 12,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 14,
  //         playerId: 'a',
  //         isSideView: true,
  //         isMiddle: false
  //       }
  //     },

  //     // LEVEL 2 - ICE
  //     {
  //       type: 'ice',
  //       config: {
  //         height: 8,
  //         width: 4,
  //         x: 7,
  //         y: 4,
  //       }
  //     },
  //     {
  //       type: 'ice',
  //       config: {
  //         height: 8,
  //         width: 4,
  //         x: 14,
  //         y: 4,
  //       }
  //     },
  //     {
  //       type: 'ice',
  //       config: {
  //         height: 8,
  //         width: 4,
  //         x: 21,
  //         y: 4,
  //       }
  //     },

  //     // LEVEL 2 - PITS
  //     {
  //       type: 'pit',
  //       config: {
  //         height: 8,
  //         width: 3,
  //         x: 25,
  //         y: 4,
  //       }
  //     },


  //     // LEVEL 2 - PENGUINS
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: true,
  //         startPos: {
  //           x: 11,
  //           y: 4
  //         },
  //         movementLength: 7,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: true,
  //         startPos: {
  //           x: 18,
  //           y: 4
  //         },
  //         movementLength: 7,
  //         stepSize: .1
  //       }
  //     },
  //   ]
  // },

  // LEVEL 3
  // {
  //   time: 120,
  //   hurryUpMusicTime: 25,
  //   players: [
  //     {
  //       startPos: {
  //         x: 14,
  //         y: 1
  //       }
  //     },
  //     {
  //       startPos: {
  //         x: 14,
  //         y: 14
  //       }
  //     }
  //   ],
  //   toyType: Constants.TOY_TYPES.CAR,
  //   toysCapacity: 3,
  //   entities: [
  //     // LEVEL 3 - WALLS
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 6,
  //         x: 18,
  //         y: 2,
  //       }
  //     },
  //     {
  //       type: 'wall',
  //       config: {
  //         height: 4,
  //         width: 6,
  //         x: 4,
  //         y: 10,
  //       }
  //     },

  //     // LEVEL 3 - TABLES
  //     {
  //       type: 'table',
  //       config: {
  //         x: 6,
  //         y: 7,
  //         tableType: 3,
  //         isSideView: false,
  //         part: 1
  //       }
  //     },
  //     {
  //       type: 'table',
  //       config: {
  //         x: 19,
  //         y: 7,
  //         tableType: 2,
  //         isSideView: false,
  //         part: 2
  //       }
  //     },

  //     // LEVEL 3 - PRESENT BOXES
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 5,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 7,
  //         playerId: 'a',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 0,
  //         y: 9,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: false
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 26,
  //         y: 5,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 26,
  //         y: 7,
  //         playerId: 'a',
  //         isSideView: true,
  //         isMiddle: true
  //       }
  //     },
  //     {
  //       type: 'present-box',
  //       config: {
  //         x: 26,
  //         y: 9,
  //         playerId: 'b',
  //         isSideView: true,
  //         isMiddle: false
  //       }
  //     },


  //     // LEVEL 3 - PITS
  //     {
  //       type: 'pit',
  //       config: {
  //         height: 12,
  //         width: 8,
  //         x: 10,
  //         y: 2,
  //       }
  //     },


  //     // LEVEL 3 - PENGUINS
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 2,
  //           y: 14
  //         },
  //         movementLength: 7,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 18,
  //           y: 1
  //         },
  //         movementLength: 7,
  //         stepSize: .05
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 2,
  //           y: 2
  //         },
  //         movementLength: 7,
  //         stepSize: .07
  //       }
  //     },
  //     {
  //       type: 'penguin',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 18,
  //           y: 13
  //         },
  //         movementLength: 7,
  //         stepSize: .07
  //       }
  //     },

  //     // LEVEL 3 - PLATFORMS
  //     {
  //       type: 'platform',
  //       config: {
  //         isVertical: false,
  //         startPos: {
  //           x: 10,
  //           y: 7
  //         },
  //         height: 2,
  //         width: 2,
  //         movementLength: 6,
  //         stepSize: .07
  //       }
  //     },
  //   ]
  // },

  // LEVEL 4
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
      // LEVEL 4 - WALLS
      // LEVEL 4 - TABLES
      // LEVEL 4 - PRESENT BOXES
      // LEVEL 4 - PITS
      // LEVEL 4 - PENGUINS
      // LEVEL 4 - PLATFORMS
      // LEVEL 4 - FENCES
    ]
  },


  {
    time: 90,
    hurryUpMusicTime: 25,
    players: [
      {
        startPos: {
          x: 27,
          y: 0
        }
      },
      {
        startPos: {
          x: 0,
          y: 0
        }
      }
    ],
    toyType: Constants.TOY_TYPES.CAR,
    toysCapacity: 2,
    entities: [
      {
        type: 'pit',
        config: {
          height: 5,
          width: 6,
          x: 2,
          y: 1,
        }
      },
      {
        type: 'pit',
        config: {
          height: 5,
          width: 12,
          x: 5,
          y: 10,
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: false,
          startPos: {
            x: 5,
            y: 7
          },
          movementLength: 10,
          stepSize: .05
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 4
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'wall',
        config: {
          height: 3,
          width: 2,
          x: 10,
          y: 1,
        }
      },
      {
        type: 'fence',
        config: {
          x: 20,
          y: 1,
          cells: [
            // first line
            [{
              left: true,
              top: true,
            },
            {
              top: true,
            },{
              top: true,
            }],
            // second line
            [{
              left: true,
              // right: true,
            },
            {
              left: true,
              top: true,
            },{
              top: true,
              right: true,
            }],
            [{
              left: true,
              bottom: true,
            },
            {
              bottom: true,
              right: true,
            }],
          ],
        }
      },
      {
        type: 'table',
        config: {
          x: 1,
          y: 12,
          tableType: 1,
          isSideView: false,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 13,
          y: 1,
          tableType: 2,
          isSideView: true,
          part: 2
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 14,
          playerId: 'a',
          isSideView: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 12,
          playerId: 'b',
          isSideView: true,
          isMiddle: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 19,
          y: 12,
          playerId: 'a',
          isSideView: true
        }
      },
      {
        type: 'present-box',
        config: {
          x: 19,
          y: 10,
          playerId: 'b',
          isSideView: true,
          isMiddle: true
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 22,
            y: 4
          },
          height: 2,
          width: 3,
          movementLength: 5,
          stepSize: .07
        }
      },
      {
        type: 'ice',
        config: {
          height: 4,
          width: 7,
          x: 14,
          y: 5,
        }
      },
    ]
  },
  {
    time: 45,
    players: [
      {
        startPos: {
          x: 27,
          y: 10
        }
      },
      {
        startPos: {
          x: 0,
          y: 0
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROBOT,
    toysCapacity: 1,
    entities: [
      {
        type: 'pit',
        config: {
          height: 5,
          width: 6,
          x: 2,
          y: 1,
        }
      },
      {
        type: 'wall',
        config: {
          height: 6,
          width: 10,
          x: 2,
          y: 8,
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 4
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'table',
        config: {
          x: 22,
          y: 12,
          tableType: 3,
          isSideView: true,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 10,
          y: 1,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 12,
          y: 5,
          tableType: 1,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'present-box',
        config: {
          x: 16,
          y: 12,
          toy: Constants.TOY_TYPES.ROBOT,
          playerId: 'a'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 13,
          y: 12,
          toy: Constants.TOY_TYPES.ROBOT,
          playerId: 'b'
        }
      },
    ]
  },
  {
    time: 45,
    players: [
      {
        startPos: {
          x: 27,
          y: 10
        }
      },
      {
        startPos: {
          x: 0,
          y: 0
        }
      }
    ],
    toyType: Constants.TOY_TYPES.TEDDY,
    toysCapacity: 1,
    entities: [
      {
        type: 'pit',
        config: {
          height: 5,
          width: 6,
          x: 2,
          y: 1,
        }
      },
      {
        type: 'wall',
        config: {
          height: 6,
          width: 10,
          x: 2,
          y: 8,
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 4
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'table',
        config: {
          x: 22,
          y: 12,
          tableType: 3,
          isSideView: true,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 10,
          y: 1,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 12,
          y: 5,
          tableType: 1,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'present-box',
        config: {
          x: 16,
          y: 12,
          playerId: 'a'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 13,
          y: 12,
          playerId: 'b'
        }
      },
    ]
  },
  {
    time: 45,
    players: [
      {
        startPos: {
          x: 27,
          y: 10
        }
      },
      {
        startPos: {
          x: 0,
          y: 0
        }
      }
    ],
    toyType: Constants.TOY_TYPES.ROCKET,
    toysCapacity: 1,
    entities: [
      {
        type: 'pit',
        config: {
          height: 5,
          width: 6,
          x: 2,
          y: 1,
        }
      },
      {
        type: 'wall',
        config: {
          height: 6,
          width: 10,
          x: 2,
          y: 8,
        }
      },
      {
        type: 'penguin',
        config: {
          isVertical: true,
          startPos: {
            x: 26,
            y: 4
          },
          movementLength: 5,
          stepSize: .05
        }
      },
      {
        type: 'table',
        config: {
          x: 22,
          y: 12,
          tableType: 3,
          isSideView: true,
          part: 1
        }
      },
      {
        type: 'table',
        config: {
          x: 10,
          y: 1,
          tableType: 1,
          isSideView: false,
          part: 2
        }
      },
      {
        type: 'table',
        config: {
          x: 12,
          y: 5,
          tableType: 1,
          isSideView: false,
          part: 3
        }
      },
      {
        type: 'table',
        config: {
          x: 20,
          y: 1,
          tableType: 1,
          isSideView: false,
          part: 4
        }
      },
      {
        type: 'present-box',
        config: {
          x: 16,
          y: 12,
          playerId: 'a'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 13,
          y: 12,
          playerId: 'b'
        }
      },
    ]
  },


  // LEVEL STARTER
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
      // LEVEL X - WALLS
      // LEVEL X - TABLES
      // LEVEL X - PRESENT BOXES
      // LEVEL X - ICE
      // LEVEL X - PITS
      // LEVEL X - PENGUINS
      // LEVEL X - PLATFORMS
      // LEVEL X - FENCES
    ]
  },
]
