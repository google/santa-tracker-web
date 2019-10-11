import Obj from '../../Object/index.js'

// Config
// import GLOBAL_CONFIG from '../../SceneManager/config'
import CONFIG from './config.js'

class Pyramid extends Obj {
  constructor(scene, world) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })

    const verts = [
      new CANNON.Vec3(0, 0, 0),
      new CANNON.Vec3(0, CONFIG.SIZE, 0),
      new CANNON.Vec3(CONFIG.SIZE, CONFIG.SIZE, 0),
      new CANNON.Vec3(CONFIG.SIZE, 0, 0),
      new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE)
    ]

    const offset = -0.35
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i]
      v.x += offset
      v.y += offset
      v.z += offset
    }

    const faces = [[0, 1, 2], [0, 2, 3], [1, 0, 4], [2, 1, 4], [3, 2, 4], [0, 3, 4]]

    const shape = new CANNON.ConvexPolyhedron(verts, faces)
    this.body = new CANNON.Body({ mass: CONFIG.MASS, shape })
    this.body.position.set(-0.5, 5, -0.5)
    world.add(this.body)

    // Graphics
    const pyramidGeo = this.getThreeGeo(shape)
    const pyramidMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
    this.mesh = new THREE.Mesh(pyramidGeo, pyramidMaterial)
    this.mesh.position.copy(this.body.position)
    scene.add(this.mesh)

    this.mesh.geometry.computeBoundingBox()
    this.box = this.mesh.geometry.boundingBox.clone()

    this.select()
  }

  getThreeGeo(shape) {
    const geo = new THREE.Geometry()

    // Add vertices
    for (let i = 0; i < shape.vertices.length; i++) {
      const v = shape.vertices[i]
      geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z))
    }

    for (let i = 0; i < shape.faces.length; i++) {
      const face = shape.faces[i]

      // add triangles
      const a = face[0]
      for (let j = 1; j < face.length - 1; j++) {
        const b = face[j]
        const c = face[j + 1]
        geo.faces.push(new THREE.Face3(a, b, c))
      }
    }
    geo.computeBoundingSphere()
    geo.computeFaceNormals()
    return geo
  }
}

export default Pyramid
