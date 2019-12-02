goog.provide('Levels')


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
  {
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
          partType: 'car_wheels'
        }
      },
      {
        type: 'table',
        config: {
          x: 13,
          y: 1,
          tableType: 2,
          isSideView: true,
          partType: 'robot_body'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 12,
          parts: [
            'robot_body',
            'car_wheels'
          ]
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
          partType: 'robot_heads'
        }
      },
      {
        type: 'table',
        config: {
          x: 10,
          y: 1,
          tableType: 1,
          isSideView: false,
          partType: 'robot_arms'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 15,
          y: 12,
          parts: [
            'robot_heads',
            'robot_arms'
          ]
        }
      },
    ]
  },
]
