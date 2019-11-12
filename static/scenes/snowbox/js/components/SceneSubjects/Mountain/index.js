// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'
import LoaderManager from '../../../managers/LoaderManager.js'
import { toRadian, randomInt } from '../../../utils/math.js'

class Mountain {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.selectable = CONFIG.SELECTABLE

    this.initTrees = this.initTrees.bind(this)
    this.initMount = this.initMount.bind(this)

    this.object = new THREE.Object3D()
    this.scene.add(this.object)

    LoaderManager.load({name: CONFIG.MOUNT.NAME, obj: CONFIG.MOUNT.OBJ, map: CONFIG.MOUNT.MAP}, this.initMount)
    this.initMarker()
  }

  initMount() {
    const { obj, map } = LoaderManager.subjects[CONFIG.MOUNT.NAME]

    const geometry = obj.children[0].geometry
    geometry.computeBoundingBox()
    this.mountBox = geometry.boundingBox

    const material = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT)
    mesh.position.y = -(this.mountBox.max.y - this.mountBox.min.y) / CONFIG.MODEL_UNIT / 2
    this.object.add(mesh)

    // Physics
    const shape = new CANNON.Cylinder(CONFIG.MOUNT.TOP_RADIUS, CONFIG.MOUNT.BOTTOM_RADIUS, CONFIG.SIZE, 30)
    this.mountBody = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
    this.mountBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.mountBody.position.set(0, -(CONFIG.SIZE / 2) - 0.1, 0)
    this.world.addBody(this.mountBody)

    LoaderManager.load({name: CONFIG.TREE.NAME, obj: CONFIG.TREE.OBJ}, this.initTrees)
  }

  initTrees() {
    const { obj } = LoaderManager.subjects[CONFIG.TREE.NAME]

    // Materials
    const material = new THREE.MeshToonMaterial({
      color: CONFIG.TREE.COLOR,
      shininess: 345,
    })
    const geometry = obj.children[0].geometry

    for (let i = 0; i < CONFIG.TREE.NUMBER; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      const angle = toRadian(randomInt(0, 360))
      const offset = randomInt(-2, 2)
      const scale = randomInt(1, 1.2)

      mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT * scale)
      mesh.position.y = -(this.mountBox.max.y - this.mountBox.min.y) / CONFIG.MODEL_UNIT
      mesh.position.x = Math.cos(angle) * (CONFIG.MOUNT.BOTTOM_RADIUS + offset)
      mesh.position.z = -Math.sin(angle) * (CONFIG.MOUNT.BOTTOM_RADIUS + offset)

      this.object.add(mesh)
    }
  }

  initMarker() {
    // Marker HELPER
    const markerGeometry = new THREE.PlaneGeometry(1, 1)
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x8cf0ff })
    this.markerMesh = new THREE.Mesh(markerGeometry, markerMaterial)
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

