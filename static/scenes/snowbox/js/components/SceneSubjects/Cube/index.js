import Obj from '../../Object/index.js'

import LoaderManager from '../../../managers/LoaderManager/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

const model = './models/1_cube.obj'

class Cube extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.load = this.load.bind(this)
    this.init = this.init.bind(this)

    this.material = material
  }

  load(callback) {
    this.callback = callback
    LoaderManager.load({name: CONFIG.NAME, normalMap: CONFIG.NORMAL_MAP, obj: CONFIG.OBJ}, this.init)
  }

  init() {
    const { obj, normalMap } = LoaderManager.subjects[CONFIG.NAME]

    // Props
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE

    // Geometry
    const geometry = obj.children[0].geometry
    geometry.center()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: 345,
      normalMap
    })
    defaultMaterial.needsUpdate = true

    const highlightMaterial = defaultMaterial.clone()
    highlightMaterial.color.setHex(GLOBAL_CONFIG.COLORS.HIGHLIGHT)
    highlightMaterial.needsUpdate = true

    const ghostMaterial = defaultMaterial.clone()
    ghostMaterial.color.setHex(GLOBAL_CONFIG.COLORS.GHOST)
    ghostMaterial.needsUpdate = true
    this.materials = {
      default: defaultMaterial,
      highlight: highlightMaterial,
      ghost: ghostMaterial
    }

    // CANNON JS
    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: this.material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 0, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(geometry, this.materials.default)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()

    this.callback(this)
  }

  createShape(scale = 1) {
    return new CANNON.Box(
      new CANNON.Vec3((CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale)
    )
  }
}

export default Cube
