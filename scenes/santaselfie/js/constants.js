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

goog.provide('app.Constants');


/**
 * Shared game constants
 */
app.Constants = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 1400,
  CLOTH_HEIGHT: 25,
  CLOTH_WIDTH: 22,
  START_Y: 670,
  SPACING: 20,

  // Physics constants for cloth simulation
  TIME_STEP: 16,
  PHYSICS_DELTA: 0.032 * 0.032,
  PHYSICS_ACCURACY: 3,
  MOUSE_INFLUENCE: 20,
  MOUSE_CUT: 20,
  GRAVITY: 2000,

  TEAR_DISTANCE: 80,
  ADD_DISTANCE: 100,
  DAMPING: 0.8,
  HAIRDRYER_FORCE: 5500,

  NEAR_SANTA_DIM: 230,

  // Serialization constants
  ENCODER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
};
