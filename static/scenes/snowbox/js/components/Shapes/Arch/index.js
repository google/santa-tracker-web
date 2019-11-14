import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Arch extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
  }

  init() {
    const { obj, wrl, normalMap } = LoaderManager.subjects[this.name]

    // Collision model
    this.collisionModel = wrl
    console.log(obj, wrl)

    // Geometry
    this.geometry = obj.children[0].geometry
    this.geometry.scale(1 / GLOBAL_CONFIG.MODEL_UNIT, 1 / GLOBAL_CONFIG.MODEL_UNIT, 1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.geometry.center()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: GLOBAL_CONFIG.SHININESS,
      normalMap
    })
    defaultMaterial.needsUpdate = true

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    this.body.shapes = []
    this.body.updateMassProperties()
    // this.mesh.geometry.computeBoundingBox()
    // const box = this.mesh.geometry.boundingBox.clone()

    // maybe we need to remove the all body
    // this.world.remove(this.body)
    // console.log(this.size)
    // box
    const offset1 = new CANNON.Vec3( 0, 0.25 * scale, 0)

    // height
    const height = Math.round(this.box.max.y - this.box.min.y)

    // setTimeout(() => {
    // Compound boxes
    let s = this.size * scale
    const topBoxVector = new CANNON.Vec3(s, s * 0.25, s * 0.5)
    const topShape = new CANNON.Box(topBoxVector)

    const bottomBoxVector = new CANNON.Vec3(s * 0.33, s * 0.25, s * 0.5)
    const bottomShape = new CANNON.Box(bottomBoxVector)

    this.body.addShape(topShape, offset1)
    // this.body.addShape(bottomShape)
    // this.body.addShape(bottomShape)


    this.body.shapes = []
    this.body.updateMassProperties()

    // console.log(height, topShape.halfExtents.y )
    const ok = height / 2 - topBoxVector.y
    // console.log(height, topBoxVector.y, ok)
    console.log(scale)

    // const offset1 = new CANNON.Vec3( 0, 0.25 * scale, 0)
    console.log(offset1)
    const offset2 = new CANNON.Vec3( -bottomShape.halfExtents.x * 2, -bottomShape.halfExtents.y, 0)
    const offset3 = new CANNON.Vec3( bottomShape.halfExtents.x * 2, -bottomShape.halfExtents.y, 0)
    // console.log(topShape.halfExtents)
    // console.log(offset1)
    this.body.addShape(topShape, offset1)
    // this.body.addShape(bottomShape, offset2)
    // this.body.addShape(bottomShape, offset3)

    // }, 200)
    // this.body.updateMassProperties()

  }
}

export default Arch
