import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let cubeGeo, cubeMaterial

const textureLoader = new THREE.TextureLoader()
const model = './models/1_cube.obj'
const normalMap = textureLoader.load('./models/1_cube.jpg')

// preload objs
new THREE.OBJLoader().load(model, object => {
  cubeGeo = object.children[0].geometry
  cubeGeo.center()
  cubeMaterial = new THREE.MeshToonMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
    shininess: 345,
    normalMap
  })

  cubeMaterial.needsUpdate = true
})

class Cube extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.defaultMaterial = cubeMaterial

    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 0, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  createShape(scale = 1) {
    return new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2 * scale, CONFIG.SIZE / 2 * scale, CONFIG.SIZE / 2 * scale))
  }
}

export default Cube
