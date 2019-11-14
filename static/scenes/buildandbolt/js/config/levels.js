goog.provide('Levels')

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
          height: 5,
          width: 2,
          x: 10,
          y: 1,
        }
      },
      {
        type: 'fence',
        config: {
          x: 25,
          y: 14,
          sides: {
            left: false,
            right: true,
            top: true,
            bottom: true
          }
        }
      },
      {
        type: 'fence',
        config: {
          x: 24,
          y: 14,
          sides: {
            left: false,
            right: false,
            top: true,
            bottom: true
          }
        }
      },
      {
        type: 'fence',
        config: {
          x: 26,
          y: 14,
          sides: {
            left: false,
            right: false,
            top: true,
            bottom: false
          }
        }
      },
      {
        type: 'table',
        config: {
          x: 1,
          y: 12,
          partType: 'wheels'
        }
      },
      {
        type: 'table',
        config: {
          x: 15,
          y: 1,
          partType: 'car-body'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 12,
          parts: [
            'car-body',
            'wheels'
          ]
        }
      },
      {
        type: 'platform',
        config: {
          isVertical: true,
          startPos: {
            x: 23,
            y: 4
          },
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
          x: 1,
          y: 12,
          partType: 'wheels'
        }
      },
      {
        type: 'table',
        config: {
          x: 15,
          y: 1,
          partType: 'car-body'
        }
      },
      {
        type: 'present-box',
        config: {
          x: 22,
          y: 12,
          parts: [
            'car-body',
            'wheels'
          ]
        }
      },
    ]
  },
]
