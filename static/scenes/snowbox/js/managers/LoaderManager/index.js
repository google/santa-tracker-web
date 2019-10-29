class LoaderManager {
  constructor() {
    this.subjects = {}

    this.textureLoader = new THREE.TextureLoader()
    this.OBJLoader = new THREE.OBJLoader()

    this.loadNormal = this.loadNormal.bind(this)
    this.loadOBJ = this.loadOBJ.bind(this)
    this.load = this.load.bind(this)
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

    Promise.all(promises).then(callback)
  }
}


export default new LoaderManager()