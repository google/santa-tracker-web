import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

class Tree extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.wrl = CONFIG.WRL
  }

  init() {
    const { obj, wrl } = LoaderManager.subjects[this.name]

    // Collision model
    this.collisionModel = wrl[0]

    // Geometry
    this.geometry = obj.children[0].geometry
    // this.geometry.center()
    // console.log(this.geometry, this.collisionModel.vertices)

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: 345,
    })
    defaultMaterial.needsUpdate = true

    this.setShape(defaultMaterial)
  }

  createShape(scale = 1) {
    return this.getCannonShapeFromWRL(this.collisionModel, scale)
  }

  getCannonShapeFromWRL(model, scale) {
    const vertices = []
    const faces = []

    for (let i = 0; i < model.vertices.length; i += 3) {
      vertices.push( new CANNON.Vec3(model.vertices[i] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 1] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 2] / GLOBAL_CONFIG.MODEL_UNIT * scale))
    }

    for (let i = 0; i < model.faces.length; i += 3) {
      faces.push([model.faces[i], model.faces[i + 1], model.faces[i + 2]])
    }

    const shape = new CANNON.ConvexPolyhedron(vertices, faces)

    return shape
  }
}

export default Tree
