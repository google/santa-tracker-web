import Obj from '../../Object/index.js'
import WRLLoader from '../../../loaders/WRLLoader.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let geometry, material, vhacdModel

const textureLoader = new THREE.TextureLoader()
const model = './models/pine-tree_v01.obj'
const wrl = './models/pine-tree_v01.wrl'
// const normalMap = textureLoader.load('./models/shape_03--normal.jpg')

new WRLLoader().load(wrl).then(object => {
  vhacdModel = object[0]
  console.log(vhacdModel)
})

// preload objs
new THREE.OBJLoader().load(model, object => {
  geometry = object.children[0].geometry
  // geometry.center()
  console.log(geometry)
  material = new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
  })
})

class Tree extends Obj {
  constructor(scene, world, type) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = material

    // CANNONJS PART
    const shape = this.createShape()

    this.body = new CANNON.Body({
      mass: 1,
      shape,
      fixedRotation: false,
      material: type === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)


    // Mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    // this.mesh.position.x = 10
    this.mesh.rotation.x = Math.PI;

    console.log(this.mesh)

    this.addToScene()
  }

  createShape(scale = 1) {
    return this.getCannonShapeFromWRL(vhacdModel, scale)
  }

  getCannonShapeFromWRL(geometry, scale) {
    const vertices = []
    const faces = []

    for (let i = 0; i < geometry.vertices.length; i += 3) {
      vertices.push( new CANNON.Vec3(geometry.vertices[i] / GLOBAL_CONFIG.MODEL_UNIT * scale, geometry.vertices[i + 1] / GLOBAL_CONFIG.MODEL_UNIT * scale, geometry.vertices[i + 2] / GLOBAL_CONFIG.MODEL_UNIT * scale))
    }

    for (let i = 0; i < geometry.faces.length; i += 3) {
      faces.push([geometry.faces[i], geometry.faces[i + 1], geometry.faces[i + 2]])
    }

    const shape = new CANNON.ConvexPolyhedron(vertices, faces)
    return shape
  }
}

export default Tree


