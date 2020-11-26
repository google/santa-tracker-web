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

import { DEBUG_MODE } from '../../../constants/index.js'

export default class PlaneHelper {
  constructor(scene) {
    // Help moving object with the mouse always in the center of the object
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, visible: DEBUG_MODE })
    const geometry = new THREE.PlaneGeometry(50, 50, 1, 1)

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.y = 1
    this.mesh.rotation.x = -Math.PI / 2

    scene.add(this.mesh)
  }
}
