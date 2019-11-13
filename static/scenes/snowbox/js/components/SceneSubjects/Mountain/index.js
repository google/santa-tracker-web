// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'
import LoaderManager from '../../../managers/LoaderManager.js'
import Scene from '../../Scene/index.js'
import { toRadian, randomInt, randomFloat } from '../../../utils/math.js'

class Mountain {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
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
    const shape = new CANNON.Cylinder(CONFIG.MOUNT.TOP_RADIUS, CONFIG.MOUNT.BOTTOM_RADIUS, CONFIG.MOUNT.HEIGHT, 30)
    this.mountBody = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
    this.mountBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.mountBody.position.set(0, -(CONFIG.MOUNT.HEIGHT / 2) - 0.1, 0)
    this.world.addBody(this.mountBody)

    LoaderManager.load({name: CONFIG.TREE.NAME, obj: CONFIG.TREE.OBJ}, this.initTrees)
    LoaderManager.load({name: CONFIG.BOARD.NAME, obj: CONFIG.BOARD.OBJ, map: CONFIG.BOARD.MAP}, this.initBoard)
    LoaderManager.load({name: CONFIG.ROCK_01.NAME, obj: CONFIG.ROCK_01.OBJ}, () => {
      LoaderManager.load({name: CONFIG.ROCK_02.NAME, obj: CONFIG.ROCK_02.OBJ}, this.initRocks)
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
      const scale = randomFloat(1, 1.2)

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
      const scale = randomFloat(0.3, 0.5)

      mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * scale)
      mesh.position.y = 0
      mesh.position.x = Math.cos(angle) * (CONFIG.MOUNT.TOP_RADIUS + offset)
      mesh.position.z = -Math.sin(angle) * (CONFIG.MOUNT.TOP_RADIUS + offset)

      this.object.add(mesh)

      // Physics
      const shape = new CANNON.Box(new CANNON.Vec3(scale / 2, scale / 2, scale / 2))
      const body = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
      body.position.x = mesh.position.x
      body.position.y = mesh.position.y
      body.position.z = mesh.position.z
      // this.world.addBody(body)


      // box
      mesh.geometry.computeBoundingBox()
      const box = mesh.geometry.boundingBox.clone()
      box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld)

      const subject = { body, mesh, box, selectable: true, }

      // Scene.sceneSubjects.push(subject)
    }
  }

  initBoard() {
    const { obj, map } = LoaderManager.subjects[CONFIG.BOARD.NAME]

    const geometry = obj.children[0].geometry
    const material = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    const angle = toRadian(-135)
    const distance = CONFIG.MOUNT.TOP_RADIUS * 0.8
    const scale = 0.8

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * scale)
    mesh.position.y = 2
    mesh.position.x = Math.cos(angle) * distance
    mesh.position.z = -Math.sin(angle) * distance
    mesh.rotation.y = toRadian(90)
    this.object.add(mesh)

    // Physics
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

