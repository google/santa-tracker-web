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

  ROTATE_ANGLE: 45,

  PEN_MIN: 5,
  PEN_MAX: 50,
  PENCIL_MIN: 5,
  PENCIL_MAX: 10,
  ERASER_MIN: 10,
  ERASER_MAX: 100,
  SHAPE_MIN: 0.5,
  SHAPE_MAX: 3.0,
  STAMP_MIN: 0.5,
  STAMP_MAX: 2.5,
  STICKER_MIN: 0.25,
  STICKER_MAX: 1.5,
  SPRAY_CIRCLE_SIZE: 50,
  SPRAY_MIN: 100,
  SPRAY_MAX: 300,
  TINSEL_MIN: 0.1,
  TINSEL_MAX: 0.2,
  FROSTING_MIN: 0.05,
  FROSTING_MAX: 0.2,
  PAINT_ROLLER_MIN: 25,
  PAINT_ROLLER_MAX: 100,

  SNOW_MAX_X: 0.02,
  SNOW_MAX_Y: 0.05,
  SNOW_MAX_SIZE: 10,
  SNOW_MAX_PARTICLES: 60,
  SNOW_MIN_DISTANCE: 0.2,

  // Needs to match _colors.scss
  SVG_COLOR_MATRIX: {
    "#8bc34a": {
      "primary": "#8bc34a",
      "highlight": "#93d839",
      "medium": "#65af35",
      "dark": "#1d9904",
      "complement": "#e51c23"
    },
    "#ffeb3b": {
      "primary": "#ffeb3b",
      "highlight": "#fffb73",
      "medium": "#ffcc3e",
      "dark": "#ffa33e",
      "complement": "#03a9f4"
    },
    "#ffc107": {
      "primary": "#ffc107",
      "highlight": "#ffdb08",
      "medium": "#ffa506",
      "dark": "#ff7708",
      "complement": "#e91e63"
    },
    "#ff5722": {
      "primary": "#ff5722",
      "highlight": "#ff8101",
      "medium": "#ef4010",
      "dark": "#e51b23",
      "complement": "#ffc107"
    },
    "#e91e63": {
      "primary": "#e91e63",
      "highlight": "#fc3d86",
      "medium": "#d60756",
      "dark": "#b20044",
      "complement": "#ff9800"
    },
    "#259b24": {
      "primary": "#259b24",
      "highlight": "#22af22",
      "medium": "#008e00",
      "dark": "#00750b",
      "complement": "#ffc107"
    },
    "#cddc39": {
      "primary": "#cddc39",
      "highlight": "#e7ef41",
      "medium": "#b5cc0e",
      "dark": "#6dba00",
      "complement": "#9c27b0"
    },
    "#ff9800": {
      "primary": "#ff9800",
      "highlight": "#ffb703",
      "medium": "#ff7503",
      "dark": "#ff5703",
      "complement": "#e91e63"
    },
    "#e51c23": {
      "primary": "#e51c23",
      "highlight": "#ff0619",
      "medium": "#c61724",
      "dark": "#af0000",
      "complement": "#8bc34a"
    },
    "#9c27b0": {
      "primary": "#9c27b0",
      "highlight": "#c30fe8",
      "medium": "#8a11a8",
      "dark": "#6e0687",
      "complement": "#cddc39"
    },
    "#3f51b5": {
      "primary": "#3f51b5",
      "highlight": "#4661e0",
      "medium": "#2e46aa",
      "dark": "#293e96",
      "complement": "#ff9800"
    },
    "#03a9f4": {
      "primary": "#03a9f4",
      "highlight": "#06c5f2",
      "medium": "#0692f2",
      "dark": "#0677f2",
      "complement": "#ffeb3b"
    },
    "#6ae5b9": {
      "primary": "#6ae5b9",
      "highlight": "#8efcdc",
      "medium": "#40d39b",
      "dark": "#53bca6",
      "complement": "#9c27b0"
    },
    "#9e9e9e": {
      "primary": "#9e9e9e",
      "highlight": "#bdbdbd",
      "medium": "#848484",
      "dark": "#777777",
      "complement": "#e51c23"
    },
    "#f2faff": {
      "primary": "#f2faff",
      "highlight": "#ffffff",
      "medium": "#d4ecf9",
      "dark": "#acd1e2",
      "complement": "#03a9f4"
    },
    "#673ab7": {
      "primary": "#673ab7",
      "highlight": "#764acc",
      "medium": "#54349b",
      "dark": "#48219e",
      "complement": "#ff9800"
    },
    "#5677fc": {
      "primary": "#5677fc",
      "highlight": "#6c9dff",
      "medium": "#3f66e0",
      "dark": "#1c40c6",
      "complement": "#cddc39"
    },
    "#009688": {
      "primary": "#009688",
      "highlight": "#06bca6",
      "medium": "#008474",
      "dark": "#007a7a",
      "complement": "#5677fc"
    },
    "#795548": {
      "primary": "#795548",
      "highlight": "#895c4e",
      "medium": "#6b493f",
      "dark": "#593d36",
      "complement": "#03a9f4"
    },
    "#212121": {
      "primary": "#212121",
      "highlight": "#333333",
      "medium": "#111111",
      "dark": "#000000",
      "complement": "#3f51b5"
    }
  },
};
