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

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'
import LoaderManager from '../../../managers/LoaderManager.js'
import { toRadian, randomInt, randomFloat } from '../../../utils/math.js'

class Mountain {
  constructor(scene, world, sceneSubjects) {
    this.scene = scene
    this.world = world
    this.sceneSubjects = sceneSubjects
    this.selectable = CONFIG.SELECTABLE

    this.bind()

    this.object = new THREE.Object3D()
    this.scene.add(this.object)

    LoaderManager.load({name: CONFIG.MOUNT.NAME, obj: CONFIG.MOUNT.OBJ, map: CONFIG.MOUNT.MAP}, this.initMount)
    this.initMarker()
  }

  bind() {
    this.initTrees = this.initTrees.bind(this)
    this.initMount = this.initMount.bind(this)
    this.initRocks = this.initRocks.bind(this)
    this.initBoard = this.initBoard.bind(this)
  }

  initMount() {
    const { obj, map } = LoaderManager.subjects[CONFIG.MOUNT.NAME]

    const geometry = obj.children[0].geometry
    geometry.computeBoundingBox()
    this.mountBox = geometry.boundingBox

    const material = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 150,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT)
    mesh.position.y = -(this.mountBox.max.y - this.mountBox.min.y) / CONFIG.MODEL_UNIT / 2
    this.object.add(mesh)

    // Physics
    const shape = new CANNON.Cylinder(CONFIG.MOUNT.TOP_RADIUS, CONFIG.MOUNT.BOTTOM_RADIUS, CONFIG.MOUNT.HEIGHT, 50)
    this.mountBody = new CANNON.Body({
      mass: 0,
      shape,
      // material: GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.mountBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.mountBody.position.set(0, -(CONFIG.MOUNT.HEIGHT / 2) - 0.08, 0)
    this.world.addBody(this.mountBody)

    LoaderManager.load({name: CONFIG.TREE.NAME, obj: CONFIG.TREE.OBJ}, this.initTrees)
    LoaderManager.load({name: CONFIG.ROCK_01.NAME, obj: CONFIG.ROCK_01.OBJ}, () => {
      LoaderManager.load({name: CONFIG.ROCK_02.NAME, obj: CONFIG.ROCK_02.OBJ}, this.initRocks)
      LoaderManager.load({name: CONFIG.BOARD.NAME, obj: CONFIG.BOARD.OBJ, map: CONFIG.BOARD.MAP}, this.initBoard)
    })
  }

  initTrees() {
    const { obj } = LoaderManager.subjects[CONFIG.TREE.NAME]

    // Materials
    const material = new THREE.MeshToonMaterial({
      color: CONFIG.TREE.COLOR,
      shininess: 100,
    })
    const geometry = obj.children[0].geometry

    for (let i = 0; i < CONFIG.NUMBER_TREES; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      const angle = toRadian(randomInt(0, 360))
      const offset = randomInt(-2, 2)
      const scale = randomFloat(1.9, 2.4)

      mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * scale)
      mesh.position.y = -(this.mountBox.max.y - this.mountBox.min.y) / CONFIG.MODEL_UNIT
      mesh.position.x = Math.cos(angle) * (CONFIG.MOUNT.BOTTOM_RADIUS + offset)
      mesh.position.z = -Math.sin(angle) * (CONFIG.MOUNT.BOTTOM_RADIUS + offset)

      this.object.add(mesh)
    }
  }

  initRocks() {
    const { obj: obj1 } = LoaderManager.subjects[CONFIG.ROCK_01.NAME]
    const { obj: obj2 } = LoaderManager.subjects[CONFIG.ROCK_02.NAME]

    // Materials
    const material = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 100,
    })
    const geometries = [obj1.children[0].geometry, obj2.children[0].geometry]

    for (let i = 0; i < CONFIG.NUMBER_ROCKS; i++) {
      const mesh = new THREE.Mesh(geometries[randomInt(0, 1)], material)
      const angle = toRadian(randomInt(0, 360))
      const offset = randomInt(-CONFIG.MOUNT.TOP_RADIUS, -1)
      const scale = randomFloat(0.07, 0.2)
      const rotation = toRadian(randomInt(0, 360))

      mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * scale)
      mesh.position.y = 0
      mesh.position.x = Math.cos(angle) * (CONFIG.MOUNT.TOP_RADIUS + offset)
      mesh.position.z = -Math.sin(angle) * (CONFIG.MOUNT.TOP_RADIUS + offset)
      mesh.rotation.y = rotation

      this.object.add(mesh)
    }
  }

  initBoard() {
    const board = new THREE.Object3D()

    const { obj, map } = LoaderManager.subjects[CONFIG.BOARD.NAME]
    const angle = toRadian(-135)
    const distance = CONFIG.MOUNT.TOP_RADIUS * 0.8
    const scale = 0.8

    const geometry = obj.children[0].geometry
    geometry.scale(1 / CONFIG.MODEL_UNIT * scale, 1 / CONFIG.MODEL_UNIT * scale, 1 / CONFIG.MODEL_UNIT * scale)
    const material = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 2
    mesh.position.x = Math.cos(angle) * distance
    mesh.position.z = -Math.sin(angle) * distance
    mesh.rotation.y = toRadian(90)

    board.add(mesh)


    // add rocks
    const { obj: rockObj1 } = LoaderManager.subjects[CONFIG.ROCK_01.NAME]
    const rockMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 100,
    })

    const rockGeometry = rockObj1.children[0].geometry

    // 1
    const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial)
    rockMesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * 0.5)
    rockMesh.position.copy(mesh.position)
    rockMesh.position.y = 0
    rockMesh.position.x += 1
    board.add(rockMesh)

    // 2
    const rockMesh2 = new THREE.Mesh(rockGeometry, rockMaterial)
    rockMesh2.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * 0.4)
    rockMesh2.position.copy(mesh.position)
    rockMesh2.position.y = 0
    rockMesh2.position.x -= 1
    rockMesh2.position.z += 1
    rockMesh2.rotation.y = toRadian(120)
    board.add(rockMesh2)

    // 3
    const rockMesh3 = new THREE.Mesh(rockGeometry, rockMaterial)
    rockMesh3.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * 1)
    rockMesh3.position.copy(mesh.position)
    rockMesh3.position.y = 0
    rockMesh3.position.z -= 1.5
    rockMesh3.position.x -= 1.5
    rockMesh3.rotation.y = toRadian(45)
    board.add(rockMesh3)

    this.object.add(board)

    // box
    const box = new THREE.Box3().setFromObject(board)

    // Physics
    const shape = new CANNON.Box(new CANNON.Vec3((box.max.x - box.min.x) / 2 * 0.1, (box.max.y - box.min.y) / 2, (box.max.z - box.min.z) / 2 * 0.7))
    const body = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
    body.position.x = mesh.position.x
    body.position.y = mesh.position.y - 0.3
    body.position.z = mesh.position.z
    this.world.addBody(body)

    const subject = { body, mesh: board, selectable: false, collidable: true }

    this.sceneSubjects.push(subject)
  }

  initMarker() {
    // Marker HELPER
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshLambertMaterial({ color: 0x8cf0ff })
    this.markerMesh = new THREE.Mesh(geometry, material)
  }

  addPositionMarker(position) {
    let { x, z } = position

    this.markerMesh.position.set(x, 0.01, z)
    this.markerMesh.quaternion.copy(this.mountBody.quaternion)
    this.scene.add(this.markerMesh)
  }

  removePositionMarker() {
    this.scene.remove(this.markerMesh)
  }

  movePositionMarker(x, z) {
    this.markerMesh.position.set(x, 0.01, z)
  }
}

export default Mountain
