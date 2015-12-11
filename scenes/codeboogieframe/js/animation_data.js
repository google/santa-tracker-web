/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.AnimationData');

app.AnimationData = (color) => {
  let sharedMoves = {
    "carlton_0": {
      "width": 240,
      "height": 369,
      "offsetX": 476,
      "offsetY": 141
    },
    "carlton_1": {
      "width": 243,
      "height": 371,
      "offsetX": 471,
      "offsetY": 139
    },
    "carlton_2": {
      "width": 257,
      "height": 372,
      "offsetX": 458,
      "offsetY": 138
    },
    "carlton_3": {
      "width": 248,
      "height": 372,
      "offsetX": 467,
      "offsetY": 138
    },
    "clap_0": {
      "width": 235,
      "height": 361,
      "offsetX": 480,
      "offsetY": 149
    },
    "elvis_0": {
      "width": 236,
      "height": 367,
      "offsetX": 480,
      "offsetY": 143
    },
    "elvis_1": {
      "width": 225,
      "height": 365,
      "offsetX": 478,
      "offsetY": 145
    },
    "hip_0": {
      "width": 219,
      "height": 360,
      "offsetX": 468,
      "offsetY": 150
    },
    "hip_1": {
      "width": 237,
      "height": 359,
      "offsetX": 446,
      "offsetY": 151
    },
    "idle_0": {
      "width": 182,
      "height": 361,
      "offsetX": 480,
      "offsetY": 149
    },
    "jump_0": {
      "width": 236,
      "height": 432,
      "offsetX": 453,
      "offsetY": 78
    },
    "jump_1": {
      "width": 212,
      "height": 433,
      "offsetX": 470,
      "offsetY": 77
    },
    "pointLeft_0": {
      "width": 219,
      "height": 367,
      "offsetX": 459,
      "offsetY": 143
    },
    "pointLeft_1": {
      "width": 222,
      "height": 367,
      "offsetX": 439,
      "offsetY": 143
    },
    "pointRight_0": {
      "width": 254,
      "height": 366,
      "offsetX": 480,
      "offsetY": 144
    },
    "pointRight_1": {
      "width": 275,
      "height": 370,
      "offsetX": 480,
      "offsetY": 140
    },
    "splits_0": {
      "width": 254,
      "height": 360,
      "offsetX": 449,
      "offsetY": 151
    },
    "splits_1": {
      "width": 268,
      "height": 380,
      "offsetX": 438,
      "offsetY": 131
    },
    "spongebob_0": {
      "width": 262,
      "height": 374,
      "offsetX": 480,
      "offsetY": 136
    },
    "spongebob_1": {
      "width": 246,
      "height": 369,
      "offsetX": 450,
      "offsetY": 141
    },
    "stepLeft_0": {
      "width": 375,
      "height": 436,
      "offsetX": 299,
      "offsetY": 74
    },
    "stepLeft_1": {
      "width": 398,
      "height": 361,
      "offsetX": 262,
      "offsetY": 149
    },
    "stepRight_0": {
      "width": 244,
      "height": 360,
      "offsetX": 480,
      "offsetY": 150
    },
    "stepRight_1": {
      "width": 289,
      "height": 366,
      "offsetX": 481,
      "offsetY": 144
    },
    "thriller_0": {
      "width": 186,
      "height": 365,
      "offsetX": 480,
      "offsetY": 145
    },
    "thriller_1": {
      "width": 237,
      "height": 370,
      "offsetX": 465,
      "offsetY": 140
    },
    "thriller_2": {
      "width": 277,
      "height": 373,
      "offsetX": 485,
      "offsetY": 137
    },
    "thriller_3": {
      "width": 235,
      "height": 361,
      "offsetX": 480,
      "offsetY": 149
    },
    "watch_0": {
      "width": 183,
      "height": 358,
      "offsetX": 480,
      "offsetY": 152
    },
    "watch_1": {
      "width": 183,
      "height": 358,
      "offsetX": 480,
      "offsetY": 152
    }
  };

  let purpleMoves = {
    "fail_0": {
      "width": 317,
      "height": 354,
      "offsetX": 400,
      "offsetY": 156
    },
    "fail_1": {
      "width": 234,
      "height": 358,
      "offsetX": 480,
      "offsetY": 152
    }
  };

  if (color !== 'green') {
    goog.object.extend(sharedMoves, purpleMoves);
  }

  return sharedMoves;
};
