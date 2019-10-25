import Obj from '../../Object/index.js'
import WRLLoader from '../../../managers/WRLLoader.js'
import { generateBody } from '../../../utils/createCollisionBodies.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

import modelJSON from '../../../../models/pine-tree_v02.json'

let geometry, material, finalObject

const textureLoader = new THREE.TextureLoader()
const model = './models/pine-tree_v01.obj'
const wrl = './models/pine-tree_v01.wrl'
// const normalMap = textureLoader.load('./models/shape_03--normal.jpg')

new WRLLoader().load(wrl).then(object => {
    console.log(object)
    finalObject = object
})

// preload objs
new THREE.OBJLoader().load(model, object => {
  geometry = object.children[0].geometry
  geometry.center()
  console.log(geometry)
  material = new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
  })
})

class PineTree extends Obj {
  constructor(scene, world, type) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = material

    // CANNONJS PART

    this.body = generateBody(finalObject, { mass: CONFIG.MASS, scale: 10 })
    // const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    // this.body = new CANNON.Body({
    //   mass: this.mass,
    //   shape,
    //   fixedRotation: false,
    //   material: type === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    // })
    console.log(this.body)
    // console.log(this.body2)
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  scaleBody() {
    const shape = this.body.shapes[0]
    console.log(shape)
    // shape.halfExtents.set(
    //   (CONFIG.SIZE / 2) * this.scaleFactor,
    //   (CONFIG.SIZE / 2) * this.scaleFactor,
    //   (CONFIG.SIZE / 2) * this.scaleFactor
    // )
    // shape.updateConvexPolyhedronRepresentation()
    console.log(CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3))
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default PineTree


