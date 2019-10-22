import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

import modelJSON from '../../../../models/pine-tree_v01.json'

let geometry, material

const textureLoader = new THREE.TextureLoader()
const model = './models/pine-tree_v01.obj'
// const normalMap = textureLoader.load('./models/shape_03--normal.jpg')

// preload objs
new THREE.OBJLoader().load(model, object => {
  geometry = object.children[0].geometry
  geometry.center()
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

    // CANNONJS PART

    // const bunnyBody = new CANNON.Body({ mass: this.mass });

    // // console.log(geometry, modelJSON)

    // var rawVerts = modelJSON.vertices;
    // var rawFaces = modelJSON.faces;
    // // var rawOffset = bunny[i].offset;

    // var verts=[], faces=[], offset;

    // // Get vertices
    // for(var j=0; j< rawVerts.length; j+=3){
    //     verts.push(new CANNON.Vec3( rawVerts[j]  ,
    //                                 rawVerts[j+1],
    //                                 rawVerts[j+2]));
    // }

    // // Get faces
    // for(var j=0; j<rawFaces.length; j+=3){
    //     faces.push([rawFaces[j],rawFaces[j+1],rawFaces[j+2]]);
    // }

    // // Get offset
    // // offset = new CANNON.Vec3(rawOffset[0],rawOffset[1],rawOffset[2]);

    // // Construct polyhedron
    // var bunnyPart = new CANNON.ConvexPolyhedron(verts, faces);

    // // Add to compound
    // bunnyBody.addShape(bunnyPart, offset);

    // console.log(bunnyBody)


    // for(var i=0; i< bunny.length; i++){

    //     var rawVerts = bunny[i].verts;
    //     var rawFaces = bunny[i].faces;
    //     var rawOffset = bunny[i].offset;

    //     var verts=[], faces=[], offset;

    //     // Get vertices
    //     for(var j=0; j<rawVerts.length; j+=3){
    //         verts.push(new CANNON.Vec3( rawVerts[j]  ,
    //                                     rawVerts[j+1],
    //                                     rawVerts[j+2]));
    //     }

    //     // Get faces
    //     for(var j=0; j<rawFaces.length; j+=3){
    //         faces.push([rawFaces[j],rawFaces[j+1],rawFaces[j+2]]);
    //     }

    //     // Get offset
    //     offset = new CANNON.Vec3(rawOffset[0],rawOffset[1],rawOffset[2]);

    //     // Construct polyhedron
    //     var bunnyPart = new CANNON.ConvexPolyhedron(verts,faces);

    //     // Add to compound
    //     bunnyBody.addShape(bunnyPart,offset);
    // }

    const shape = new CANNON.Box(new CANNON.Vec3(CONFIG.SIZE / 2, CONFIG.SIZE / 2, CONFIG.SIZE / 2))
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: type === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    // this.body = bunnyBody
    this.body.position.set(-CONFIG.SIZE / 2, 100, -CONFIG.SIZE / 2)

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()

    this.addToScene()
  }

  scaleBody() {
    const shape = this.body.shapes[0]
    shape.halfExtents.set(
      (CONFIG.SIZE / 2) * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor,
      (CONFIG.SIZE / 2) * this.scaleFactor
    )
    shape.updateConvexPolyhedronRepresentation()
    console.log(CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3))
    this.body.mass = CONFIG.MASS * Math.pow(CONFIG.SIZE * this.scaleFactor, 3)
    this.body.computeAABB()
    this.body.updateMassProperties()
  }
}

export default PineTree


