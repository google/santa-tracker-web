import Obj from '../../Object/index.js'

// Config
// import GLOBAL_CONFIG from '../../SceneManager/config'
import CONFIG from './config.js'

class Glue extends Obj {
  constructor(scene, world) {
    // Physics
    super()

    this.world = world

    this.selectable = CONFIG.SELECTABLE

    this.mass = CONFIG.MASS

    this.constrainedBodies = []

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, 0.025, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({ mass: this.mass, shape })
    this.body.position.set(-0.5, 5, -0.5)
    world.add(this.body)

    // Graphics
    const cubeGeo = new THREE.BoxGeometry(CONFIG.SIZE, 0.05, CONFIG.SIZE, 2, 2)
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    scene.add(this.mesh)

    this.select()
    this.body.addEventListener('collide', this.handleCollide.bind(this))
  }

  handleCollide(e) {
    if (!this.selected) {
      const collidedBody = e.body
      if (!this.constrainedBodies.includes(collidedBody)) {
        const constraint = new CANNON.LockConstraint(this.body, collidedBody)
        this.world.addConstraint(constraint)
        this.constrainedBodies.push(collidedBody)
      }
    }
  }
}

export default Glue
