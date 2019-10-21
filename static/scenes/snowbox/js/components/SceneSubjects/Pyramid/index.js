import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

const textureLoader = new THREE.TextureLoader()
const normalMap = textureLoader.load('./models/shape_03-cube-normal.jpg')

class Pyramid extends Obj {
  constructor(scene, world) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS

    // Graphics
    const pyramidGeo = this.getThreeGeo()
    const pyramidMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.ICE,
      shininess: 345,
      normalMap
    })

    pyramidMaterial.needsUpdate = true
    this.defaultMaterial = pyramidMaterial
    this.mesh = new THREE.Mesh(pyramidGeo, pyramidMaterial)

    const shape = this.getCannonShape(pyramidGeo)
    this.body = new CANNON.Body({ mass: CONFIG.MASS, shape, fixedRotation: true })
    this.body.position.set(-0.5, 5, -0.5)

    this.addToScene()
    this.select()
  }

  getThreeGeo() {
    const geo = new THREE.Geometry()
    const vertices = this.getVertices()
    geo.vertices = vertices
    geo.faces = this.getFaces()
    geo.computeBoundingSphere()
    geo.computeFaceNormals()
    return geo
  }

  getVertices() {
    return [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(CONFIG.SIZE * this.scaleFactor, 0, 0),
      new THREE.Vector3(CONFIG.SIZE * this.scaleFactor, 0, CONFIG.SIZE * this.scaleFactor),
      new THREE.Vector3(0, 0, CONFIG.SIZE * this.scaleFactor),
      new THREE.Vector3(
        (CONFIG.SIZE / 2) * this.scaleFactor,
        CONFIG.SIZE * this.scaleFactor,
        (CONFIG.SIZE / 2) * this.scaleFactor
      )
    ]
  }

  getFaces() {
    return [
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(0, 2, 3),
      new THREE.Face3(1, 0, 4),
      new THREE.Face3(2, 1, 4),
      new THREE.Face3(3, 2, 4),
      new THREE.Face3(0, 3, 4)
    ]
  }

  getCannonShape(geometry) {
    const vertices = []
    const faces = []

    for (let i = 0; i < geometry.vertices.length; i++) {
      const v = geometry.vertices[i]
      vertices.push(new CANNON.Vec3(v.x, v.y, v.z))
    }

    for (let i = 0; i < geometry.faces.length; i++) {
      const f = geometry.faces[i]
      faces.push([f.a, f.b, f.c])
    }

    return new CANNON.ConvexPolyhedron(vertices, faces)
  }

  scaleBody() {
    const shape = this.body.shapes[0]
    for (let i = 0; i < shape.vertices.length; i++) {
      const v = shape.vertices[i]
      v.scale(this.scaleFactor)
    }
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default Pyramid
