/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
 'use strict';

goog.provide('app.Levels');

goog.require('app.Constants')

/**
 * Level designs
 */
app.Levels = {
  combos: [
    {
      arrows: [ // 0
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 1
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 2
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 3
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 4
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 5
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 6
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 7
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 8
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 9
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 0.75,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 10
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1.25,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 11
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 2.66,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 3,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 12
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 2.66,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 3,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 13
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 2.66,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 3,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 14
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 0.75,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 15
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 16
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 17
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 18
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 19
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1.25,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 20
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.25,
          length: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 21
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.25,
          length: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 22
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.25,
          length: 0.5,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 23
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 0.75,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
      ]
    },
    {
      arrows: [ // 24
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 25
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1.25,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
      ]
    },
    {
      arrows: [ // 26
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 1.25,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 2,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
    {
      arrows: [ // 27
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 28
        {
          beat: 0,
          directions: [app.Constants.DIRECTIONS.DOWN, app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 1.5,
          directions: [app.Constants.DIRECTIONS.UP, app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      arrows: [ // 29
        {
          beat: 0.25,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 0.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
      ]
    },
  ],

  levels: [
    {
      length: 80, // in beats
      startDelay: 1,
      track: [
        {
          beat: 3,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 5,
          comboIndex: 6
        },
        {
          beat: 7,
          comboIndex: 3
        },
        {
          beat: 9.5,
          comboIndex: 7
        },
        {
          beat: 15,
          comboIndex: 3
        },
        {
          beat: 17.5,
          comboIndex: 7
        },
        {
          beat: 19,
          comboIndex: 3
        },
        {
          beat: 23,
          comboIndex: 8
        },
        {
          beat: 25.5,
          comboIndex: 7
        },
        {
          beat: 31,
          comboIndex: 3
        },
        {
          beat: 35,
          comboIndex: 3
        },
        {
          beat: 37,
          comboIndex: 9
        },
        {
          beat: 43,
          comboIndex: 3
        },
        {
          beat: 47,
          comboIndex: 3
        },
        {
          beat: 49.5,
          comboIndex: 4
        },
        {
          beat: 20 + 31.5,
          comboIndex: 0
        },
        {
          beat: 23 + 32,
          comboIndex: 8
        },
        {
          beat: 25.5 + 32,
          comboIndex: 7
        },
        {
          beat: 31 + 32,
          comboIndex: 3
        },
        {
          beat: 35 + 32,
          comboIndex: 3
        },
        {
          beat: 37 + 32,
          comboIndex: 9
        },
        {
          beat: 38 + 32,
          comboIndex: 29
        },
        {
          beat: 39 + 32,
          comboIndex: 9
        },
        {
          beat: 43 + 32,
          comboIndex: 3
        },
        {
          beat: 47 + 32,
          comboIndex: 3
        },
      ]
    },
    {
      length: 111, // in beats
      startDelay: 3,
      track: [
        {
          beat: 1,
          comboIndex: 2
        },
        {
          beat: 3.5,
          comboIndex: 9
        },
        {
          beat: 6,
          length: 2,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 9,
          comboIndex: 11
        },
        {
          beat: 14,
          length: 2,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 17,
          comboIndex: 12
        },
        {
          beat: 21,
          comboIndex: 13
        },
        {
          beat: 25,
          length: 2,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 29,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 31,
          comboIndex: 15
        },
        {
          beat: 33,
          comboIndex: 13
        },
        {
          beat: 37,
          comboIndex: 11
        },
        {
          beat: 41,
          comboIndex: 12
        },
        {
          beat: 45,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 47,
          comboIndex: 15
        },
        {
          beat: 49,
          comboIndex: 13
        },
        {
          beat: 53,
          comboIndex: 13
        },
        {
          beat: 59,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 61,
          comboIndex: 9
        },
        {
          beat: 63,
          length: 1,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 17 + 48,
          comboIndex: 12
        },
        {
          beat: 21 + 48,
          comboIndex: 13
        },
        {
          beat: 25 + 48,
          length: 2,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 29 + 48,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 31 + 48,
          comboIndex: 15
        },
        {
          beat: 33 + 48,
          comboIndex: 13
        },
        {
          beat: 37 + 48,
          comboIndex: 11
        },
        {
          beat: 41 + 48,
          comboIndex: 12
        },
        {
          beat: 45 + 48,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 47 + 48,
          comboIndex: 15
        },
        {
          beat: 49 + 48,
          comboIndex: 13
        },
        {
          beat: 53 + 48,
          comboIndex: 13
        },
        {
          beat: 59 + 48,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 61 + 48,
          comboIndex: 9
        },
      ]
    },
    {
      length: 98, // in beats
      startDelay: 3,
      track: [
        {
          beat: 1,
          comboIndex: 17
        },
        {
          beat: 5,
          comboIndex: 18
        },
        {
          beat: 9,
          comboIndex: 16
        },
        {
          beat: 10.5,
          comboIndex: 10
        },
        {
          beat: 13,
          comboIndex: 21
        },
        {
          beat: 15.5,
          length: 2,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 21,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 21.25,
          length: 2,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 26.5,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 29,
          comboIndex: 19
        },
        {
          beat: 31,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 33,
          comboIndex: 21
        },
        {
          beat: 37,
          comboIndex: 22
        },
        {
          beat: 41,
          comboIndex: 20
        },
        {
          beat: 45,
          comboIndex: 20
        },
        {
          beat: 50.5,
          comboIndex: 10
        },
        {
          beat: 53,
          length: 2,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 58,
          comboIndex: 10
        },
        {
          beat: 62,
          comboIndex: 19
        },
        {
          beat: 65,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 67,
          comboIndex: 9
        },
        {
          beat: 71,
          comboIndex: 23
        },
        {
          beat: 73,
          comboIndex: 21
        },
        {
          beat: 77,
          comboIndex: 22
        },
        {
          beat: 83,
          comboIndex: 9
        },
        {
          beat: 85,
          comboIndex: 21
        },
        {
          beat: 87,
          comboIndex: 23
        },
        {
          beat: 89,
          comboIndex: 22
        },
        {
          beat: 91,
          comboIndex: 9
        },
        {
          beat: 94,
          comboIndex: 19
        },
        {
          beat: 96,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
      ]
    },
    {
      length: 155, // in beats
      startDelay: 0,
      track: [
        {
          beat: 3,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 7.5,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 9,
          comboIndex: 24
        },
        {
          beat: 11.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 14.5,
          comboIndex: 27
        },
        {
          beat: 19,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 24,
          comboIndex: 25
        },
        {
          beat: 28,
          length: 2,
          directions: [app.Constants.DIRECTIONS.LEFT]
        },
        {
          beat: 32,
          comboIndex: 25
        },
        {
          beat: 36,
          comboIndex: 26
        },
        {
          beat: 40,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 44,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 48,
          comboIndex: 24
        },
        {
          beat: 52,
          comboIndex: 25
        },
        {
          beat: 56,
          comboIndex: 26
        },
        {
          beat: 60,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 62.5,
          comboIndex: 28
        },
        {
          beat: 66,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 70.5,
          comboIndex: 28
        },
        {
          beat: 74,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 80,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 82,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 86,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 88,
          comboIndex: 1
        },
        {
          beat: 32 + 64,
          comboIndex: 25
        },
        {
          beat: 36 + 64,
          comboIndex: 26
        },
        {
          beat: 40 + 64,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 44 + 64,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 48 + 64,
          comboIndex: 24
        },
        {
          beat: 52 + 64,
          comboIndex: 25
        },
        {
          beat: 56 + 64,
          comboIndex: 26
        },
        {
          beat: 60 + 64,
          length: 1.5,
          directions: [app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 62.5 + 64,
          comboIndex: 28
        },
        {
          beat: 66 + 64,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 70.5 + 64,
          comboIndex: 28
        },
        {
          beat: 74 + 64,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 80 + 64,
          directions: [app.Constants.DIRECTIONS.LEFT, app.Constants.DIRECTIONS.RIGHT]
        },
        {
          beat: 82 + 64,
          directions: [app.Constants.DIRECTIONS.DOWN]
        },
        {
          beat: 86 + 64,
          directions: [app.Constants.DIRECTIONS.UP]
        },
        {
          beat: 88 + 64,
          comboIndex: 25
        },
      ]
    },
  ]
};
