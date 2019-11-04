import WRLLoader from '../../components/WRLLoader/index.js'

class LoaderManager {
  constructor() {
    this.subjects = {}

    this.textureLoader = new THREE.TextureLoader()
    this.OBJLoader = new THREE.OBJLoader()
    this.WRLLoader = new WRLLoader()

    this.load = this.load.bind(this)
    this.loadNormal = this.loadNormal.bind(this)
    this.loadOBJ = this.loadOBJ.bind(this)
    this.loadWRL = this.loadWRL.bind(this)
  }

  loadNormal(object) {
    const { normalMap, name } = object
    return new Promise(resolve => {
      this.textureLoader.load(normalMap, result => {
        this.subjects[name].normalMap = result
        resolve(result)
      })
    })
  }

  loadOBJ(object) {
    const { obj, name } = object
    return new Promise(resolve => {
      this.OBJLoader.load(obj, result => {
        this.subjects[name].obj = result
        resolve(object)
      })
    })
  }

  loadWRL(object) {
    const { wrl, name } = object
    return new Promise(resolve => {
      this.WRLLoader.load(wrl).then(result => {
        this.subjects[name].wrl = result
        resolve(object)
      })
    })
  }

  loadTextureInArray(url, name, order) {
    return new Promise(resolve => {
      this.textureLoader.load(url, result => {
        result.order = order
        this.subjects[name].images.push(result)
        resolve(result)
      })
    })
  }

  load(object, callback) {
    // if element already loaded, callback directly
    if (this.subjects[object.name]) {
      callback()
      return
    }

    // else, wait for all objects of the element to be loaded
    const promises = []

    this.subjects[object.name] = {}

    if (object.normalMap){
      promises.push(this.loadNormal(object))
    }

    if (object.obj){
      promises.push(this.loadOBJ(object))
    }

    if (object.wrl){
      promises.push(this.loadWRL(object))
    }

    if (object.skybox) {
      const { prefix, directions, suffix } = object.skybox
      if (!this.subjects[object.name].images) {
        this.subjects[object.name].images = []
      }

      for (let i = 0; i < 6; i++) {
        promises.push(this.loadTextureInArray(prefix + directions[i] + suffix, object.name, i))
      }
    }

    Promise.all(promises).then(callback)
  }
}


export default new LoaderManager()