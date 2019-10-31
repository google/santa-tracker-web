// Config
// import GLOBAL_CONFIG from '../../SceneManager/config.js'
// import CONFIG from './config.js'
import { toRadian } from '../../../utils/math.js'

const textureLoader = new THREE.TextureLoader()
const imagePrefix = './img/skybox_v02/';
var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
var imageSuffix = ".png";
const materialArray = []
for (var i = 0; i < 6; i++) {
  materialArray.push( new THREE.MeshBasicMaterial({
    map: textureLoader.load( imagePrefix + directions[i] + imageSuffix ),
    side: THREE.BackSide
  }));
}


class Sky {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera

    this.onGui = this.onGui.bind(this)

    this.gui = new dat.GUI()
    this.guiController = {
      cube_scale: 1,
      cube_y_pos: -20,
    }
    this.gui.add(this.guiController, 'cube_scale', 0.0, 5.0).onChange(this.onGui)
    this.gui.add(this.guiController, 'cube_y_pos', -100, 100).onChange(this.onGui)


    this.init()
  }

  init() {

    var skyGeometry = new THREE.CubeGeometry( 62, 62, 62 );

    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    this.skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
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
