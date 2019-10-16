import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

let cubeGeo, cubeMaterial
// function loadCube() {
//   new THREE.MTLLoader().load('./models/snow_box02.mtl', materials => {
//     materials.preload()

//     new THREE.OBJLoader().setMaterials(materials).load('./models/snow_box02.obj', object => {
//       cubeGeo = object.children[0].geometry
//       cubeMaterial = object.children[0].material
//     })
//   })
// }
// loadCube()

const textureLoader = new THREE.TextureLoader()

const shapes = [{
  model: './models/shape_02-cube.obj',
  normal: textureLoader.load( './models/shape_02-cube-normal.jpg' ),
}, {
  model: './models/shape_02-cube-deplie.obj',
  normal: textureLoader.load( './models/shape_02-cube-deplie-normal.jpg' ),
}]
const currentShape = 0

// preload objs
new THREE.OBJLoader().load(shapes[0].model, object => {
  cubeGeo = object.children[0].geometry
  cubeGeo.center()
  // cubeGeo.dynamic = true
  cubeMaterial = new THREE.MeshToonMaterial( {
    color: 0xffffff,
    shininess: 345,
    // roughness: this.guiController.roughness,
    // metalness: this.guiController.metalness,
    normalMap: shapes[0].normal,
  } )

  cubeMaterial.needsUpdate = true
})

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
    this.mesh.scale.multiplyScalar(1 / 200) // related to the model, our unit is 200
    this.mesh.updateMatrix()

    this.addToScene()
  }
}

export default Cube
