import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let treeGeo, treeMaterial

const textureLoader = new THREE.TextureLoader()
const model = './models/5_tree.obj'
const material = './models/5_tree.mtl'

// preload objs
new THREE.MTLLoader().load(material, materials => {
  materials.preload()
  treeMaterial = materials.materials.Mat
  treeMaterial.color.set(GLOBAL_CONFIG.COLORS.ICE)
  treeMaterial.shininess = 345
  treeMaterial.needsUpdate = true

  const loader = new THREE.OBJLoader()
  loader.setMaterials(materials)
  loader.load(model, object => {
    treeGeo = object.children[0].geometry
    treeGeo.center()
  })
})

class Cube extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = treeMaterial

    this.shapeHeight = (treeGeo.boundingBox.max.y - treeGeo.boundingBox.min.y) * (1 / GLOBAL_CONFIG.MODEL_UNIT)

    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 0, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(treeGeo, treeMaterial)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  createShape(scale = 1) {
    return new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2 * scale, this.shapeHeight / 2 * scale, CONFIG.SIZE / 2 * scale))
  }
}

export default Cube
