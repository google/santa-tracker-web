import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let sphereGeo, materials

const textureLoader = new THREE.TextureLoader()
const model = './models/4_sphere.obj'
const material = './models/4_sphere.mtl'

// preload objs
new THREE.MTLLoader().load(material, loadedMaterials => {
  loadedMaterials.preload()
  const defaultMaterial = loadedMaterials.materials.Mat
  defaultMaterial.color.setHex(GLOBAL_CONFIG.COLORS.ICE)
  defaultMaterial.shininess = 345
  defaultMaterial.needsUpdate = true

  const highlightMaterial = defaultMaterial.clone()
  highlightMaterial.color.setHex(GLOBAL_CONFIG.COLORS.HIGHLIGHT)
  highlightMaterial.needsUpdate = true

  const ghostMaterial = defaultMaterial.clone()
  ghostMaterial.color.setHex(GLOBAL_CONFIG.COLORS.GHOST)
  ghostMaterial.needsUpdate = true

  materials = {
    default: defaultMaterial,
    highlight: highlightMaterial,
    ghost: ghostMaterial
  }

  const loader = new THREE.OBJLoader()
  loader.setMaterials(materials.default)
  loader.load(model, object => {
    sphereGeo = object.children[0].geometry
    sphereGeo.center()
  })
})

class Sphere extends Obj {
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
    this.body.position.set(-CONFIG.SIZE / 2, 0, -CONFIG.SIZE / 2)
    // Mesh
    this.mesh = new THREE.Mesh(sphereGeo, materials.default)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  createShape(scale = 1) {
    return new CANNON.Sphere((CONFIG.SIZE / 2) * scale)
  }
}

export default Sphere
