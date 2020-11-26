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
  SELECTABLE: false,
  MODEL_UNIT: 20,
  NUMBER_TREES: 10,
  NUMBER_ROCKS: 60,
  MOUNT: {
    NAME: 'mount',
    OBJ: './models/mountain/mount.obj',
    MAP: './models/mountain/mount.jpg',
    TOP_RADIUS: 18.225,
    BOTTOM_RADIUS: 18.225 * 1.45,
    HEIGHT: 18,
  },
  BOARD: {
    NAME: 'board',
    OBJ: './models/mountain/board.obj',
    MAP: './models/mountain/board.jpg',
  },
  TREE: {
    NAME: 'mountain-tree',
    OBJ: './models/mountain/tree.obj',
    COLOR: 0x03B4CA,
  },
  ROCK_01: {
    NAME: 'rock_01',
    OBJ: './models/mountain/rock_01.obj',
  },
  ROCK_02: {
    NAME: 'rock_02',
    OBJ: './models/mountain/rock_02.obj',
  }
}
