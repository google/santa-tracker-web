import Obj from '../../Object/index.js'

// Config
// import GLOBAL_CONFIG from '../../SceneManager/config'
import CONFIG from './config.js'

class Cube extends Obj {
  constructor(scene, world, cubeGeo, cubeMaterial, selectedMaterial, highlightMaterial) {
    // Physics
    super()

    this.scene = scene
    this.world = world

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.originMaterial = cubeMaterial
    this.selectedMaterial = selectedMaterial
    this.highlightMaterial = highlightMaterial

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({ mass: this.mass, shape, fixedRotation: false })
    this.body.position.set(-CONFIG.SIZE / 2, 5, -CONFIG.SIZE / 2)
    world.add(this.body)

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    this.mesh.scale.multiplyScalar( 0.0055 ); // related to the model
    scene.add(this.mesh)

    this.select()
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
