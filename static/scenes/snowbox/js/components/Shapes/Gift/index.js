import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

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
  }

  init() {
    const { obj } = LoaderManager.subjects[this.name]

    console.log(obj)

    // Geometry
    this.geometry = obj.children[0].geometry
    this.geometry.center()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: GLOBAL_CONFIG.SHININESS,
    })
    defaultMaterial.needsUpdate = true

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    const shape = new CANNON.Box(
      new CANNON.Vec3((CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale)
    )

    this.body.addShape(shape)
  }
}

export default Gift
