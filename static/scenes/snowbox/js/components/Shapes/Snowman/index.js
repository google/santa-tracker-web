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

class Snowman extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.collidable = CONFIG.COLLIDABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.highlightColor = new THREE.Color(darken(CONFIG.MAIN_COLOR_HEXA, 15))
  }

  init() {
    const { obj, normalMap, map } = LoaderManager.subjects[this.name]

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLOR,
      shininess: GLOBAL_CONFIG.SHININESS,
      map,
      normalMap
    })
    defaultMaterial.needsUpdate = true

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      this.geoMats.push({
        geometry,
        material: defaultMaterial,
      })
    }

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    // Compound
    const s = this.size * scale

    const sphere = new CANNON.Sphere(0.5 * s)
    const cone = new CANNON.Cylinder(0, 0.1 * s, 0.45 * s, 10 * s)

    const coneOffset = new CANNON.Vec3(0.7 * s, 0, 0)
    const coneQuaternion = new THREE.Quaternion()
    coneQuaternion.setFromAxisAngle( new THREE.Vector3(0, 1, 0), Math.PI / 2)

    this.body.addShape(sphere)
    this.body.addShape(cone, coneOffset, coneQuaternion)
  }
}

export default Snowman
