// Config
// import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'
import { toRadian } from '../../../utils/math.js'
import LoaderManager from '../../../managers/LoaderManager/index.js'

class Sky {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera

    this.onGui = this.onGui.bind(this)
    this.init = this.init.bind(this)

    this.gui = new dat.GUI()
    this.guiController = {
      cube_scale: 1,
      cube_y_pos: -20,
    }
    this.gui.add(this.guiController, 'cube_scale', 0.0, 5.0).onChange(this.onGui)
    this.gui.add(this.guiController, 'cube_y_pos', -100, 100).onChange(this.onGui)

    LoaderManager.load({name: CONFIG.NAME, skybox: {
      prefix: CONFIG.PREFIX,
      directions: CONFIG.DIRECTIONS,
      suffix: CONFIG.SUFFIX,
    }}, this.init)
  }

  init() {
    const geometry = new THREE.CubeGeometry( 62, 62, 62 )
    const { images } = LoaderManager.subjects[CONFIG.NAME]

    const material = []
    images.sort((a, b) => (a.order > b.order) ? 1 : -1) // sort images by order
    images.forEach(image => {
      material.push( new THREE.MeshBasicMaterial({
        map: image,
        side: THREE.BackSide
      }));
    })

    this.skyBox = new THREE.Mesh( geometry, material );
    this.skyBox.position.y = this.guiController.cube_y_pos
    this.skyBox.rotation.y = Math.PI / 2
    this.scene.add( this.skyBox );
  }

  onGui() {
    this.skyBox.position.y = this.guiController.cube_y_pos
    this.skyBox.scale.set(this.guiController.cube_scale, this.guiController.cube_scale, this.guiController.cube_scale)
  }
}

export default Sky
