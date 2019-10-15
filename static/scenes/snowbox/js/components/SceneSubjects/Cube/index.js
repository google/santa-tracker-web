import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let cubeGeo, cubeMaterial
function loadCube() {
  new THREE.MTLLoader().load('./models/snow_box02.mtl', materials => {
    materials.preload()

    new THREE.OBJLoader().setMaterials(materials).load('./models/snow_box02.obj', object => {
      cubeGeo = object.children[0].geometry
      cubeMaterial = object.children[0].material
    })
  })
}
loadCube()

class Cube extends Obj {
  constructor(scene, world, material) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = cubeMaterial

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    this.mesh.scale.multiplyScalar(0.005) // related to the model
    this.mesh.updateMatrix()

    this.addToScene()
    // this.body.addEventListener('collide', this.handleCollide.bind(this))
  }

  handleCollide(e) {
    if (!this.selected) {
      if (e.body.shapes[0] instanceof CANNON.Box) {
        if ((Math.abs(e.contact.ri.x - e.contact.rj.x) + Math.abs(e.contact.ri.z - e.contact.rj.z)) / 2 < 0.5) {
          if (e.body.id > e.target.id) {
            //Make that only one merge event is happening
            this.merge(e)
          }
        }
      }
    }
  }

  merge(e) {
    const topBlock = e.target.position.y > e.body.position.y ? e.target : e.body
    const bottomBlock = e.target.position.y < e.body.position.y ? e.target : e.body

    if (!this.mergeStarted) {
      this.emit('merge', topBlock, bottomBlock)
    }
  }

  updateMeshFromBody() {
    const shape = this.body.shapes[0]
    const cubeGeo = new THREE.BoxGeometry(CONFIG.SIZE, shape.halfExtents.y * 2, CONFIG.SIZE, 2, 2)
    this.mesh.geometry.vertices = cubeGeo.vertices
    this.mesh.geometry.verticesNeedUpdate = true
    this.mesh.geometry.elementsNeedUpdate = true
  }
}

export default Cube
