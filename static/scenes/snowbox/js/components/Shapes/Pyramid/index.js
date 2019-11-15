import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Pyramid extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.rotationY = CONFIG.ROTATION_Y
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
    this.wrl = CONFIG.WRL
    this.scaleFactor = 1
  }

  init() {
    const { obj, normalMap } = LoaderManager.subjects[this.name]

    // Geometry
    this.geometry = obj.children[0].geometry
    // this.geometry.center()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: 345,
      normalMap,
    })
    defaultMaterial.needsUpdate = true

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    // compound
    const s = this.size * scale
    const offset = new CANNON.Vec3(0, -0.5 * s, 0)
    const axisRotation = new THREE.Vector3( 0, 1, 0 )
    const tetras = [{
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle( axisRotation, Math.PI / 4 ),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle( axisRotation, -Math.PI / 4 ),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle( axisRotation, Math.PI * 3 / 4 ),
    }, {
      shape: this.createTetraShape(s),
      offset,
      quaternion: new THREE.Quaternion().setFromAxisAngle( axisRotation, -Math.PI * 3 / 4 ),
    }]

    tetras.forEach(tetra => {
      const { shape, offset, quaternion } = tetra
      this.body.addShape(shape, offset, quaternion)
    })
  }

  createTetraShape(s) {
    const verts = [
      new CANNON.Vec3(0, 0, 0),
      new CANNON.Vec3(0.73 * s, 0, 0),
      new CANNON.Vec3(0, 1 * s, 0),
      new CANNON.Vec3(0, 0, 0.73 * s)
    ]

    const faces = [
      [0,3,2], // -x
      [0,1,3], // -y
      [0,2,1], // -z
      [1,2,3], // +xyz
    ]

    const tetra = new CANNON.ConvexPolyhedron(verts, faces);
    return tetra
  }
}

export default Pyramid
