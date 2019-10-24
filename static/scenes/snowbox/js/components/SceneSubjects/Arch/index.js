import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let archGeo, archMaterial

const textureLoader = new THREE.TextureLoader()
const model = './models/3_arch.obj'
const normalMap = textureLoader.load('./models/3_arch.jpg')

// preload objs
new THREE.OBJLoader().load(model, object => {
  archGeo = object.children[0].geometry
  archGeo.center()
  archMaterial = new THREE.MeshToonMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
    shininess: 345,
    normalMap
  })

  archMaterial.needsUpdate = true
})

class Arch extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = archMaterial

    // Mesh
    this.mesh = new THREE.Mesh(archGeo, archMaterial)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE, 0, -CONFIG.SIZE / 2)

    this.addToScene()
  }

  scaleBody() {
    console.log('scale Body')
    const shape = this.body.shapes[0]
    shape.halfExtents.set(
      CONFIG.SIZE * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor
    )
    shape.updateConvexPolyhedronRepresentation()
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default Arch
