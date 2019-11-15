import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class CannonTetra extends Obj {
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
    const { obj, normalMap } = LoaderManager.subjects[this.name]

    // Geometry
    this.geometry = obj.children[0].geometry
    // this.geometry.scale(1 / GLOBAL_CONFIG.MODEL_UNIT, 1 / GLOBAL_CONFIG.MODEL_UNIT, 1 / GLOBAL_CONFIG.MODEL_UNIT)
    // this.geometry.center()

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
    const s = this.size * scale
    const verts = [
      new CANNON.Vec3(0,0,0),
       new CANNON.Vec3(1,0,0),
       new CANNON.Vec3(0,2,0),
       new CANNON.Vec3(0,0,1)
    ]
    const faces = [
      [0,3,2], // -x
      [0,1,3], // -y
      [0,2,1], // -z
      [1,2,3], // +xyz
    ]
    const offset = new CANNON.Vec3( 0.035, 0.15, -0.2)

    const polyhedronShape = new CANNON.ConvexPolyhedron(verts, faces);
    this.body.addShape(polyhedronShape, null)
  }

  // The winding of the faces needs to be counter clockwise around the normal.
  // The resulting normal needs to point away from the center of the convex.
  // The number of faces should be few to get performance. In box2d you can add max 8 vertices in a convex shape.
  // In 3D there would be more, but if you compare to the Box, you have 6 faces (8 verts).

    // [
    //     new CANNON.Vec3(0,0,0),
    //    new CANNON.Vec3(1,0,0),
    //    new CANNON.Vec3(0,1,0),
    //    new CANNON.Vec3(0,0,1)
    //    ];
    // [
    //     [0,3,2], // -x
    //     [0,1,3], // -y
    //     [0,2,1], // -z
    //     [1,2,3], // +xyz
    // // ]
}

export default CannonTetra
