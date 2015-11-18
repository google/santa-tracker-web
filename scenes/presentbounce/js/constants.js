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
goog.provide('Constants');

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
  TOTAL_LEVELS: 10,

  // initial size of levelboard wrapper
  CANVAS_WIDTH: 1600, //1100;
  CANVAS_HEIGHT: 900, //620;

  // When do we start scaling down?
  VIEWPORT_MIN_WIDTH: 1440,
  VIEWPORT_MIN_HEIGHT: 810,

  GRAVITY: 150,
  SHADOW_OFFSET_PX: 10,
  CONVEYOR_BELT_SPEED: 4, // affects CSS animation
  CORNER_RESOLUTION: 10,
  SCREEN_Y_LIMIT: window.innerHeight,
  
  PHYSICS_SCALE: 30,
  // MIN_PHYSICS_FPS: 1 / 50,
};


// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
