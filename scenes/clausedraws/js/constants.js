/*
 * Copyright 2017 Google Inc. All rights reserved.
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
  CANVAS_WIDTH_LANDSCAPE: 1600,
  CANVAS_HEIGHT_LANDSCAPE: 900,
  CANVAS_WIDTH_PORTRAIT: 900,
  CANVAS_HEIGHT_PORTRAIT: 1200,
  NUM_BACKUPS: 32,

  COLORPICKER_DEFAULT: "8bc34a",

  PEN_MIN: 5,
  PEN_MAX: 50,
  PENCIL_MIN: 5,
  PENCIL_MAX: 10,
  ERASER_MIN: 10,
  ERASER_MAX: 100,
  STAMP_MIN: 0.5,
  STAMP_MAX: 2.5,
  SPRAY_CIRCLE_SIZE: 50,
  SPRAY_MIN: 100,
  SPRAY_MAX: 300,
  PAINT_ROLLER_MIN: 25,
  PAINT_ROLLER_MAX: 100,

  SNOW_MAX_X: 0.02,
  SNOW_MAX_Y: 0.05,
  SNOW_MAX_SIZE: 10,
  SNOW_MAX_PARTICLES: 60,
  SNOW_MIN_DISTANCE: 0.2
};
