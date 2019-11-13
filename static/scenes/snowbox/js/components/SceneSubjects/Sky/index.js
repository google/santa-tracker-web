// Config
// import GLOBAL_CONFIG from '../../Scene/config.js'
import CONFIG from './config.js'
import { toRadian } from '../../../utils/math.js'
import LoaderManager from '../../../managers/LoaderManager.js'

class Sky {
  constructor(scene) {
    this.scene = scene

    this.onGui = this.onGui.bind(this)
    this.init = this.init.bind(this)

    // this.gui = new dat.GUI()
    // this.guiController = {
    //   cube_scale: CONFIG.SCALE,
    //   cube_y_pos: CONFIG.Y_POS,
    // }
    // this.gui.add(this.guiController, 'cube_scale', 0.0, 5.0).onChange(this.onGui)
    // this.gui.add(this.guiController, 'cube_y_pos', -100, 100).onChange(this.onGui)

    LoaderManager.load({name: CONFIG.NAME, skybox: {
      prefix: CONFIG.PREFIX,
      directions: CONFIG.DIRECTIONS,
      suffix: CONFIG.SUFFIX,
    }}, this.init)
  }

  init() {
    const geometry = new THREE.CubeGeometry( 62, 62, 62 )
    const { textures } = LoaderManager.subjects[CONFIG.NAME]

    const material = []
    textures.sort((a, b) => (a.order > b.order) ? 1 : -1) // sort textures by order
    textures.forEach(texture => {
      material.push( new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      }));
    })

    this.skyBox = new THREE.Mesh( geometry, material )
    this.skyBox.position.y = CONFIG.Y_POS
    this.skyBox.rotation.y = toRadian(CONFIG.Y_ROTATION)
    this.skyBox.scale.set(CONFIG.SCALE, CONFIG.SCALE, CONFIG.SCALE)
    this.scene.add( this.skyBox )
  }

  onGui() {
    this.skyBox.position.y = this.guiController.cube_y_pos
    this.skyBox.scale.set(this.guiController.cube_scale, this.guiController.cube_scale, this.guiController.cube_scale)
  }
}

export default Sky
