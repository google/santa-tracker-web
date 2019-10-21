import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let cubeGeo, cubeMaterial

const textureLoader = new THREE.TextureLoader()
const model = './models/shape_03-cube.obj'
const normalMap = textureLoader.load('./models/shape_03-cube-normal.jpg')

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
    this.defaultMaterial = cubeMaterial

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  scaleBody() {
    const shape = this.body.shapes[0]
    shape.halfExtents.set(
      (CONFIG.SIZE / 2) * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor
    )
    shape.updateConvexPolyhedronRepresentation()
    console.log(CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3))
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default Cube
