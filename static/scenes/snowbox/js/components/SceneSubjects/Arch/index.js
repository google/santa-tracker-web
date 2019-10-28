import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let archGeo, materials

const textureLoader = new THREE.TextureLoader()
const model = './models/3_arch.obj'
const normalMap = textureLoader.load('./models/3_arch.jpg')

// preload objs
new THREE.OBJLoader().load(model, object => {
  archGeo = object.children[0].geometry
  archGeo.center()
  const defaultMaterial = new THREE.MeshToonMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
    shininess: 345,
    normalMap
  })

  const highlightMaterial = defaultMaterial.clone()
  highlightMaterial.color.setHex(GLOBAL_CONFIG.COLORS.HIGHLIGHT)
  highlightMaterial.needsUpdate = true

  const ghostMaterial = defaultMaterial.clone()
  ghostMaterial.color.setHex(GLOBAL_CONFIG.COLORS.GHOST)
  ghostMaterial.needsUpdate = true

  defaultMaterial.needsUpdate = true
  materials = {
    default: defaultMaterial,
    highlight: highlightMaterial,
    ghost: ghostMaterial
  }
})

class Arch extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.materials = materials

    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })

    // Mesh
    this.mesh = new THREE.Mesh(archGeo, materials.default)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  createShape(scale = 1) {
    return new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE * scale, (CONFIG.SIZE / 2) * scale, (CONFIG.SIZE / 2) * scale))
  }
}

export default Arch
