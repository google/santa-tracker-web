// Config
// import GLOBAL_CONFIG from '../../SceneManager/config.js'
// import CONFIG from './config.js'
import { toRadian } from '../../../utils/math.js'

const textureLoader = new THREE.TextureLoader()
const imagePrefix = './img/skybox/';
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
    this.init()
  }

  init() {

    var skyGeometry = new THREE.CubeGeometry( 50, 50, 50 );

    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    skyBox.position.y = -15
    skyBox.rotation.y = Math.PI / 2
    this.scene.add( skyBox );
  }
}

export default Sky
