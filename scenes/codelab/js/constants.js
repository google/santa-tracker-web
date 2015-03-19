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

goog.provide('Constants');
goog.provide('app.Constants');

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  BLOCK_X_COORDINATE: 20,
  BLOCK_Y_COORDINATE: 24,
  BLOCK_Y_COORDINATE_INTERVAL: 170,

  LEVEL_USABLE_ROWS: 12,
  LEVEL_USABLE_MAX_COLS: 7,
  LEVEL_USABLE_MIN_COLS: 5,

  BLOCKLY_MIN_WIDTH: 220,
  EDGE_MIN_WIDTH: 48,
  SCENE_TOGGLE_DURATION: 300,
  SCENE_TOGGLE_MIN_DRAG: 20
};

// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
