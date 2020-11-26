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

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Pyramid extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.rotationY = CONFIG.ROTATION_Y
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.wrl = CONFIG.WRL
    this.scaleFactor = 1
  }

  init() {
    const { obj, normalMap } = LoaderManager.subjects[this.name]

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: GLOBAL_CONFIG.SHININESS,
      normalMap,
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
    // compound
    const s = this.size * scale
    const offset = new CANNON.Vec3(0, -0.5 * s, 0)
    const axisRotation = new THREE.Vector3(0, 1, 0)
    const tetras = [{
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, Math.PI / 4),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, -Math.PI / 4),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, Math.PI * 3 / 4),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, -Math.PI * 3 / 4),
    }]

    tetras.forEach(tetra => {
      const { shape, quaternion } = tetra
      this.body.addShape(shape, offset, quaternion)
    })
  }

  createTetraShape(s) {
    const verts = [
      new CANNON.Vec3(0, 0, 0),
      new CANNON.Vec3(0.73 * s, 0, 0),
      new CANNON.Vec3(0, 1 * s, 0),
      new CANNON.Vec3(0, 0, 0.73 * s)
    ]

    const faces = [
      [0,3,2], // -x
      [0,1,3], // -y
      [0,2,1], // -z
      [1,2,3], // +xyz
    ]

    return new CANNON.ConvexPolyhedron(verts, faces)
  }
}

export default Pyramid
