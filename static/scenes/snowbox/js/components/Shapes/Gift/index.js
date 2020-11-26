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

import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'
import { darken } from '../../../utils/colors.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Gift extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.mulipleMaterials = true
    this.highlightColor = new THREE.Color(darken(CONFIG.MAIN_COLOR_HEXA, 15))
  }

  init() {
    const { obj } = LoaderManager.subjects[this.name]

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLORS[0],
      shininess: GLOBAL_CONFIG.SHININESS,
    })
    defaultMaterial.needsUpdate = true

    const secondMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLORS[1],
      shininess: GLOBAL_CONFIG.SHININESS,
    })

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry

      let material
      if (i !== 4) {
        material = defaultMaterial
      } else {
        material = secondMaterial
      }

      this.geoMats.push({
        geometry,
        material,
      })
    }

    this.setShape(secondMaterial)
  }

  createShapes(scale = 1) {
    const shape = new CANNON.Box(
      new CANNON.Vec3((CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale)
    )

    const offset = new CANNON.Vec3(-0.09 * scale, -0.015 * scale, 0.05 * scale)

    this.body.addShape(shape, offset)
  }
}

export default Gift
