/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
  ANIMATE_SPEED: 100,
  BOX: 125,
  POSITION: {
    Y: 50,
    Z: 100
  },
  /*
   * ROTATE
   */
  ROTATE: {
    Y: 45,
    XZ: 45 / 2,
    XZ_MIN: 22.5,
    XZ_MAX: -45,
    SPEED: 800,
    FORCE_ON_WHEEL: 2,
    FORCE_ON_TOUCH: 2.2,
  },
  /*
   * ZOOM
   */
  ZOOM: {
    FOV: 0.6, // 0.6
    MAX: -60,
    MIN: 30,
    SPEED: 800,
    FORCE: 30,
  },
  /*
   * MOVE ON EDGES
   */
  EDGES_SPEED: 0.15,
  /*
   * CONTROLS
   */
  CONTROLS: {
    MIN: 10,
    MAX: 500,
    MIN_ANGLE: 0,
    MAX_ANGLE: Math.PI,
    KEYS: false,
    PAN: true,
    ROTATE: false,
    DAMPING: true,
    DAMPING_FACTOR: 0.06,
    ZOOM: false
  },
  MOBILE_CONTROLS: {
    MIN: 20,
    MAX: 100,
    MIN_ANGLE: 0,
    MAX_ANGLE: Math.PI / 2 - 0.1,
    ROTATE: true,
    ZOOM: true
  }
}
