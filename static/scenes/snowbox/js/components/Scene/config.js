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
  BACKGROUND_COLOR: 0x2c96ff,
  // Scene background color
  COLORS: {
    ICE: 0x56b8e1,
    ICE_HEXA: '#56b8e1',
    TERRAIN: 0xd2d2d2,
    GHOST: 0xf0f0f0,
  },
  SHININESS: 330,
  MODEL_UNIT: 198.8005,
  SCENE_SIZE: 1000,
  TIMESTEP: 1 / 60,
  ELEVATE_SCALE: 0.05,
  CASE_SIZE: 1,
  // CANNON.JS
  // SLIPPERY_MATERIAL: new CANNON.Material('SLIPPERY_MATERIAL'),
  // NORMAL_MATERIAL: new CANNON.Material('NORMAL_MATERIAL'),
  EDGES_PERCENT_SIZE: 0.05 // 5% of screen
}
