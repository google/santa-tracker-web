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
'use strict'

goog.provide('app.Unit');

goog.require('app.Constants');


/**
 * Static helper functions for converting between pixels and Box2D SI units
 */
app.Unit = class {
  /**
   * Convert Box2D world SI unit to pixels
   */
  static fromWorld(m) {
    return m * app.Constants.PHYSICS_SCALE;
  }
  /**
   * Convert pixels to Box2D world SI unit
   */
  static toWorld(px) {
    return px / app.Constants.PHYSICS_SCALE;
  }
  /**
   * Convert percentage of canvas to Box2D world SI units
   * @return Object<x, y>
   */
  static relativeWorld(percentageX, percentageY) {
     const x = app.Unit.toWorld(app.Constants.CANVAS_WIDTH * percentageX);
     const y = app.Unit.toWorld(app.Constants.CANVAS_HEIGHT * percentageY);
     return {x, y};
  }
}