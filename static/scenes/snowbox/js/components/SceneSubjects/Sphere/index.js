import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let sphereGeo, sphereMaterial

const textureLoader = new THREE.TextureLoader()
const model = './models/4_sphere.obj'
const material = './models/4_sphere.mtl'

// preload objs
new THREE.MTLLoader().load(material, materials => {
  materials.preload()
  sphereMaterial = materials.materials.Mat
  sphereMaterial.color.set(GLOBAL_CONFIG.COLORS.ICE)
  sphereMaterial.shininess = 345
  sphereMaterial.needsUpdate = true

  const loader = new THREE.OBJLoader()
  loader.setMaterials(materials)
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
    this.defaultMaterial = sphereMaterial

    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 0, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(sphereGeo, sphereMaterial)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  createShape(scale = 1) {
    return new CANNON.Sphere(CONFIG.SIZE / 2 * scale)
  }
}

export default Sphere
