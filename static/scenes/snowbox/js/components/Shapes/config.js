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

import { DEBUG_MODE } from '../../constants/index.js'

export default {
  SCALE_FACTOR: 1.1,
  ROTATE_CIRCLE_MATERIAL: new THREE.MeshBasicMaterial({
    color: 0xFFCF51,
    side: THREE.DoubleSide,
    depthTest: false,
    transparent: true,
    opacity: 0.4,
  }),
  HELPER_MATERIAL: new THREE.PointsMaterial({ visible: DEBUG_MODE, color: 0xff000 }),
  Y_POS_LIMIT: -20,
}
