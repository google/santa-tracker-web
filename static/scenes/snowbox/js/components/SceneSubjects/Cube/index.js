import Obj from '../../Object/index.js'

// Config
// import GLOBAL_CONFIG from '../../SceneManager/config'
import CONFIG from './config.js'

class Cube extends Obj {
  constructor(scene, world, cubeGeo, cubeMaterial, selectedMaterial) {
    // Physics
    super()

    // console.log(cubeGeo)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.originMaterial = cubeMaterial
    this.selectedMaterial = selectedMaterial

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({ mass: this.mass, shape })
    this.body.position.set(-0.5, 5, -0.5)
    world.add(this.body)

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    this.mesh.scale.multiplyScalar( 0.0055 ); // related to the model
    scene.add(this.mesh)

    this.select()
  }
}

export default Cube
