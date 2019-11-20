import Obj from '../index.js'
import LoaderManager from '../../../managers/LoaderManager.js'

// Config
import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'

class Snowman extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    // Props
    this.material = material
    this.selectable = CONFIG.SELECTABLE
    this.collidable = CONFIG.COLLIDABLE
    this.mass = CONFIG.MASS
    this.size = CONFIG.SIZE
    this.name = CONFIG.NAME
    // this.normalMap = CONFIG.NORMAL_MAP
    this.obj = CONFIG.OBJ
  }

  init() {
    const { obj, normalMap, map } = LoaderManager.subjects[this.name]

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: CONFIG.COLOR,
      shininess: GLOBAL_CONFIG.SHININESS,
      map,
      normalMap
    })
    defaultMaterial.needsUpdate = true

    this.highlightColor = CONFIG.HIGHLIGHT_COLOR

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      this.geoMats.push({
        geometry,
        material: defaultMaterial,
      })
    }

    this.setShape(defaultMaterial)
  }

  createShapes(scale = 1) {
    // Compound
    const s = this.size * scale

    const sphere = new CANNON.Sphere(0.5 * s)
    const cone = new CANNON.Cylinder(0, 0.1 * s, 0.45 * s, 10 * s)

    const coneOffset = new CANNON.Vec3(0.7 * s, 0, 0)
    const coneQuaternion = new THREE.Quaternion()
    coneQuaternion.setFromAxisAngle( new THREE.Vector3(0, 1, 0), Math.PI / 2)

    this.body.addShape(sphere)
    this.body.addShape(cone, coneOffset, coneQuaternion)
  }
}

export default Snowman
