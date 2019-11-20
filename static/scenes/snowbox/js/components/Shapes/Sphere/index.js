import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Sphere extends Obj {
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
      normalMap
    })
    defaultMaterial.needsUpdate = true

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      geometry.center()
      this.geoMats.push({
        geometry,
        material: defaultMaterial,
      })
    }

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    const shape = new CANNON.Sphere((CONFIG.SIZE / 2) * scale)
    this.body.addShape(shape)
  }
}

export default Sphere
