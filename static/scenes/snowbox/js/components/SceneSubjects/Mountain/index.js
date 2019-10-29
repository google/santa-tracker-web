import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
// import CONFIG from './config.js'
import { randomIntFromInterval } from '../../../utils/math.js'

class Moutain extends Obj {
  constructor(scene, world) {
    super()
    this.scene = scene
    this.world = world
    this.selectable = false
    this.bodies = []
    this.meshes = []
    this.init()
  }

  init() {

  }

  update() {
    this.meshes.forEach((mesh, index) => {
      mesh.position.copy(this.bodies[index].position)
      mesh.quaternion.copy(this.bodies[index].quaternion)
    })
  }
}

export default Moutain
