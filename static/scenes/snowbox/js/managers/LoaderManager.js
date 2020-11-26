/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import WRLLoader from '../components/WRLLoader/index.js'

class LoaderManager {
  constructor() {
    this.subjects = {}

    this.textureLoader = new THREE.TextureLoader()
    this.OBJLoader = new THREE.OBJLoader()
    this.WRLLoader = new WRLLoader()

    this.load = this.load.bind(this)
  }

  load(object, callback) {
    // if element already loaded, callback directly
    if (this.subjects[object.name]) {
      callback()
      return
    }

    // else, wait for all objects of the element to be loaded
    const { name, normalMap, map, obj, wrl, skybox } = object
    const promises = []

    this.subjects[name] = {}

    if (normalMap) {
      promises.push(this.loadTexture(normalMap, name, 'normalMap'))
    }

    if (map) {
      promises.push(this.loadTexture(map, name, 'map'))
    }

    if (obj) {
      promises.push(this.loadOBJ(obj, name))
    }

    if (wrl) {
      promises.push(this.loadWRL(wrl, name))
    }

    if (skybox) {
      if (!this.subjects[name].textures) {
        this.subjects[name].textures = []
      }

      const { prefix, directions, suffix } = skybox
      for (let i = 0; i < 6; i++) {
        promises.push(this.loadTexture(prefix + directions[i] + suffix, name, 'multiple', i))
      }
    }

    if (object.gif) {
      this.subjects[object.name].sources = []
      object.gif.forEach(source => {
        promises.push(this.loadGIF(object.name, source))
      })
    }

    Promise.all(promises).then(callback)
  }

  loadOBJ(url, name) {
    return new Promise(resolve => {
      this.OBJLoader.load(url, result => {
        this.subjects[name].obj = result
        resolve(result)
      })
    })
  }

  loadWRL(url, name) {
    return new Promise(resolve => {
      this.WRLLoader.load(url).then(result => {
        this.subjects[name].wrl = result
        resolve(result)
      })
    })
  }

  loadTexture(url, name, type, order = null) {
    return new Promise(resolve => {
      this.textureLoader.load(url, result => {
        if (type === 'multiple') {
          // push texture in a array
          result.order = order
          this.subjects[name].textures.push(result)
        } else {
          this.subjects[name][type] = result
        }
        resolve(result)
      })
    })
  }

  loadGIF(name, source) {
    return new Promise(resolve => {
      const image = new Image()
      image.src = source
      image.onload = () => {
        this.subjects[name].sources.push(image)
        resolve(image)
      }
    })
  }
}

export default new LoaderManager()
