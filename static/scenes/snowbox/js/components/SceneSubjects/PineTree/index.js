import Obj from '../../Object/index.js'
import WRLLoader from '../../../managers/WRLLoader.js'
import { generateBody } from '../../../utils/createCollisionBodies.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

import modelJSON from '../../../../models/pine-tree_v02.json'

let geometry, material, finalObject, body3

const textureLoader = new THREE.TextureLoader()
const model = './models/pine-tree_v01.obj'
const wrl = './models/pine-tree_v01.wrl'
// const normalMap = textureLoader.load('./models/shape_03--normal.jpg')

// var loader = new THREE.VRMLLoader();
// loader.load( wrl, function ( object ) {
//     finalObject = object
//     console.log(finalObject)
// })

new WRLLoader().load(wrl).then(object => {
    console.log(object)
    finalObject = object
  //get vertices
  var verticesArray = [];
  var verticesTemporaryArray = [];
  var Vec3Vertices;
  for(var x=0;x<object.length;x++){
      Vec3Vertices = object[x].vertices;
      // console.log(Vec3Vertices)
      for(var y =0;y<Vec3Vertices.length;y++){
      verticesTemporaryArray.push(Vec3Vertices[y].x);
      verticesTemporaryArray.push(Vec3Vertices[y].y);
      verticesTemporaryArray.push(Vec3Vertices[y].z);
      }
      verticesArray.push(verticesTemporaryArray);
      //console.log(verticesTemporaryArray); //moje obiekty
      verticesTemporaryArray = [];

  }
  // console.log(verticesArray);


//get faces
  var facesArray = [];
  var facesTemporaryArray = [];
  var Vec3faces;
  for(var x=0;x<object.length;x++){
      Vec3faces = object[x].faces;
      for(var y =0;y<Vec3faces.length;y++){
      facesTemporaryArray.push(Vec3faces[y].a);
      facesTemporaryArray.push(Vec3faces[y].b);
      facesTemporaryArray.push(Vec3faces[y].c);
      }
      facesArray.push(facesTemporaryArray);
      //console.log(verticesTemporaryArray); //moje obiekty
      facesTemporaryArray = [];

  }
  // console.log(facesArray);

  //loop through groups of model

  // var rot = new CANNON.Vec3(1,0,0)
  // body3.quaternion.setFromAxisAngle(rot,-(Math.PI/2))
  // //body3.angularVelocity.set(0,10,0);
  // body3.angularDamping = 0.6;
  // console.log(body3);
  // world.addBody(body3); //add monster
})

// preload objs
new THREE.OBJLoader().load(model, object => {
  geometry = object.children[0].geometry
  // geometry.center()
  console.log(geometry)
  material = new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
  })
})

class PineTree extends Obj {
  constructor(scene, world, type) {
    // Physics
    super(scene, world)

    this.selectable = CONFIG.SELECTABLE
    this.mass = CONFIG.MASS
    this.defaultMaterial = material

    const myVertices = []

    for (let i = 0; i < finalObject[0].vertices.length; i++) {

      // if (i % 3 === 0) {
      //   finalObject[0].vertices[i] = finalObject[0].vertices[i] + 100
      //   console.log('oui')
      // }
      myVertices.push(finalObject[0].vertices[i] / 200)
    }
    console.log(myVertices)

    // CANNONJS PART
    var modelGroupsArray = [];
    for(var g=0;g<finalObject.length;g++){
    modelGroupsArray.push(new CANNON.Trimesh(myVertices, finalObject[0].faces));
    }

    console.log(modelGroupsArray)
    body3 = new CANNON.Body({
      mass: 1,
      // shape,
      fixedRotation: false,
      material: type === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    // var rot = new CANNON.Vec3(1,1,0)
    // body3.quaternion.setFromAxisAngle(rot,-(Math.PI/2))

    // body3.position = new CANNON.Vec3(0,0,0);
    //add shape to body
    for(var g=0;g<finalObject.length;g++){
      body3.addShape(modelGroupsArray[g]);
      console.log('oui')
    }

    this.body = body3
    // this.body = generateBody(finalObject, { mass: CONFIG.MASS, scale: 10 })
    // const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    // this.body = new CANNON.Body({
    //   mass: this.mass,
    //   shape,
    //   fixedRotation: false,
    //   material: type === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    // })
    console.log(this.body)
    // console.log(this.body2)
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.mesh.position.x = 10
    this.mesh.rotation.x = Math.PI;

    this.addToScene()
  }

  scaleBody() {
    const shape = this.body.shapes[0]
    console.log(shape)
    // shape.halfExtents.set(
    //   (CONFIG.SIZE / 2) * this.scaleFactor,
    //   (CONFIG.SIZE / 2) * this.scaleFactor,
    //   (CONFIG.SIZE / 2) * this.scaleFactor
    // )
    // shape.updateConvexPolyhedronRepresentation()
    console.log(CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3))
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default PineTree


