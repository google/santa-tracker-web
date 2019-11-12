// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'
import LoaderManager from '../../../managers/LoaderManager.js'

class Mountain {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.selectable = CONFIG.SELECTABLE

    this.init = this.init.bind(this)
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
    const box = geometry.boundingBox
    const material = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    const mesh = new THREE.Mesh(geometry, material)


    mesh.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT)
    mesh.position.y = -(box.max.y - box.min.y) / CONFIG.MODEL_UNIT / 2

    this.object.add(mesh)

    // Physics
    const shape = new CANNON.Cylinder(CONFIG.PLANE_WIDTH, CONFIG.PLANE_WIDTH * 1.65, CONFIG.SIZE, 30)
    this.mountainBody = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
    this.mountainBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.mountainBody.position.set(0, -(CONFIG.SIZE / 2) - 0.1, 0)
    this.world.addBody(this.mountainBody)
  }

  init() {
    const { obj, map } = LoaderManager.subjects[CONFIG.NAME]

    // Geometry
    this.object = new THREE.Object3D()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })



    let cylinderBox

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      let material = defaultMaterial
      if (i === obj.children.length - 1) {
        // cylinder geometry
        geometry.computeBoundingBox()
        cylinderBox = geometry.boundingBox
        // add texture
        material = cylinderMaterial
      }
      const mesh = new THREE.Mesh(geometry, material)
      this.object.add(mesh)
    }

    this.object.scale.multiplyScalar(1 / CONFIG.MODEL_UNIT)
    // const box = new THREE.Box3().setFromObject( this.object );
    this.object.position.y = -(cylinderBox.max.y - cylinderBox.min.y) / CONFIG.MODEL_UNIT / 2

    this.scene.add(this.object)
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
    this.markerMesh.quaternion.copy(this.mountainBody.quaternion)
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

