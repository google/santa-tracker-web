import Obj from '../../Object/index.js'

// Config
// import GLOBAL_CONFIG from '../../SceneManager/config'
import CONFIG from './config.js'

class Cube extends Obj {
  constructor(scene, world) {
    // Physics
    super()

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({ mass: this.mass, shape })
    this.body.position.set(-0.5, 5, -0.5)
    world.add(this.body)

    // Graphics
    const cubeGeo = new THREE.BoxGeometry(CONFIG.SIZE, CONFIG.SIZE, CONFIG.SIZE, 2, 2)
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    scene.add(this.mesh)

    this.select()
  }
}

export default Cube
