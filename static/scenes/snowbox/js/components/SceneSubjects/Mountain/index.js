// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'

import LoaderManager from '../../../managers/LoaderManager/index.js'

class Moutain {
  constructor(scene) {
    this.scene = scene
    this.selectable = false

    this.init = this.init.bind(this)

    LoaderManager.load({name: CONFIG.NAME, obj: CONFIG.OBJ, map: CONFIG.MAP}, this.init)
  }

  init() {
    const { obj, map } = LoaderManager.subjects[CONFIG.NAME]
    console.log(LoaderManager.subjects[CONFIG.NAME])

    // Geometry
    this.object = new THREE.Object3D()

    // Materials
    const defaultMaterial = new THREE.MeshToonMaterial({
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    const cylinderMaterial = new THREE.MeshPhongMaterial({
      map,
      color: GLOBAL_CONFIG.COLORS.GHOST,
      shininess: 345,
    })

    let cylinderBox

    for (let i = 0; i < obj.children.length; i++) {
      const geometry = obj.children[i].geometry
      let material = defaultMaterial
      if (i === obj.children.length - 1) {
        // cylinder geometry
        geometry.computeBoundingBox()
        cylinderBox = geometry.boundingBox
        // add texture
        material = cylinderMaterial
      }
      const mesh = new THREE.Mesh(geometry, material)
      this.object.add(mesh)
    }

    this.object.scale.multiplyScalar(1 / 30)
    // const box = new THREE.Box3().setFromObject( this.object );
    this.object.position.y = -(cylinderBox.max.y - cylinderBox.min.y) / 30 / 2
    console.log(this.object.position.y)

    this.scene.add(this.object)

  }
}

export default Moutain
