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

class Tetra extends Obj {
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
    const axisRotation = new THREE.Vector3(0, 1, 0)

    const tetras = [{
      shape: this.createTetraShape([
        new CANNON.Vec3(0, 0, 0),
        new CANNON.Vec3(1 * s, 0, 0),
        new CANNON.Vec3(0, 1 * s, 0),
        new CANNON.Vec3(0, 0, 1 * s)
      ]),
      offset: new CANNON.Vec3(-0.5 * s, -0.35 * s, 0.27 * s),
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, Math.PI / 2),
    },
    {
      shape: this.createTetraShape([
        new CANNON.Vec3(0, 0, 0),
        new CANNON.Vec3(1 * s, 0, 1 * s),
        new CANNON.Vec3(0, 1 * s, 0),
        new CANNON.Vec3(0, 0, 1 * s)
      ]),
      offset: new CANNON.Vec3( 0.5 * s, -0.35 * s, 0.27 * s),
      quaternion: new THREE.Quaternion().setFromAxisAngle(axisRotation, Math.PI),
    },
    {
      shape: this.createTetraShape([
        new CANNON.Vec3(0, 0, 0),
        new CANNON.Vec3(1 * s, 1 * s, 1 * s),
        new CANNON.Vec3(0, 1 * s, 1 * s),
        new CANNON.Vec3(1 * s, 0, 1 * s),
      ]),
      offset: new CANNON.Vec3(-0.5 * s, -0.35 * s, -0.7 * s),
      quaternion: null,
    }
    ]

    tetras.forEach(tetra => {
      const { shape, offset, quaternion } = tetra
      this.body.addShape(shape, offset, quaternion)
    })
  }

  createTetraShape(verts) {
    const faces = [
      [0,3,2], // -x
      [0,1,3], // -y
      [0,2,1], // -z
      [1,2,3], // +xyz
    ]

    return new CANNON.ConvexPolyhedron(verts, faces)
  }

  // createShapes(scale = 1) {
  //   const s = this.size * scale
  //   const verts = [
  //     new CANNON.Vec3(-0.5 * s, -0.5 * s, 0.5 * s), // 0: left 0
  //     new CANNON.Vec3(0.5 * s, -0.5 * s, 0.5 * s), // 1: right 0
  //     new CANNON.Vec3(-0.5 * s, 0.5 * s, 0.5 * s), // 2: left y1
  //     new CANNON.Vec3(-0.5 * s, -0.5 * s, -0.5 * s), // 3: left z1
  //     new CANNON.Vec3(0.5 * s, 0.5 * s, 0.5 * s), // 4: right y1
  //     new CANNON.Vec3(0.5 * s, -0.5 * s, -0.5 * s), // 5: right z1
  //   ]
  //   const faces = [
  //     [0,2,3], // first face left
  //     [0,5,1], // 1/2face bottom
  //     [0,3,5], // -1/2face bottom
  //     [0,1,2], // 1/2face back
  //     [2,1,4], // -1/2face back
  //     [2,4,3], // 1/2face front
  //     [3,4,5], // -1/2face front
  //     [1,5,4], // -1/2face right
  //   ]
  //   const offset = new CANNON.Vec3( 0.035, 0.15, -0.2)

  //   const polyhedronShape = new CANNON.ConvexPolyhedron(verts, faces);
  //   this.body.addShape(polyhedronShape, offset)
  // }
}

export default Tetra
