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
import CONFIG from './config.js'

class Tree extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.collidable = CONFIG.COLLIDABLE
    this.editable = false
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.wrl = CONFIG.WRL
    this.mulipleMaterials = true
    this.centerOffsetY = -1.5
    this.highlightColor = new THREE.Color(darken(CONFIG.MAIN_COLOR_HEXA, 15))
  }

  init() {
    const { obj } = LoaderManager.subjects[this.name]

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLORS[0],
      shininess: 345,
    })
    defaultMaterial.needsUpdate = true

    const secondMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLORS[1],
      shininess: 10,
    })

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      // geometry.translate( 0, -200, 0 )
      // geometry.center()

      let material
      if (i === 0) {
        material = defaultMaterial
      } else {
        material = secondMaterial
      }

      this.geoMats.push({
        geometry,
        material,
      })
    }

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    // Compound
    const s = this.size * scale

    const cone = new CANNON.Cylinder(0, 0.4 * s, 1.5 * s, 13)
    const coneOffset = new CANNON.Vec3(0, 1.8 * s, 0)

    const cylinder = new CANNON.Cylinder(0.08 * s, 0.08 * s, 0.6 * s, 10)
    const cylinderOffset = new CANNON.Vec3(0, 0.8 * s, 0)

    const coneQuaternion = new THREE.Quaternion()
    coneQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)

    this.body.addShape(cone, coneOffset, coneQuaternion)
    this.body.addShape(cylinder, cylinderOffset, coneQuaternion)
  }
}

export default Tree
