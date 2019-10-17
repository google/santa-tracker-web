// Config
import CONFIG from './config.js'
import cubeConfig from '../SceneSubjects/Cube/config.js'

// SceneSubjects
import Cube from '../SceneSubjects/Cube/index.js'
import Lights from '../SceneSubjects/Lights/index.js'
import Pyramid from '../SceneSubjects/Pyramid/index.js'
import Terrain from '../SceneSubjects/Terrain/index.js'

import { toRadian } from '../../utils/math.js'
import { debounce } from '../../helpers.js'

// Other
import CameraController from '../CameraController/index.js'
import { world } from './world.js'

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas

    this.onGui = this.onGui.bind(this)
    this.onMaterialGui = this.onMaterialGui.bind(this)
    this.onPresetsGui = this.onPresetsGui.bind(this)
    this.onShapesGui = this.onShapesGui.bind(this)

    this.screenDimensions = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    }

    this.mode = ''
    // 0: default, can switch to any mode
    // 1: drag === moving camera: Can't click on an object or place an object
    // 2: highlight === hover on an object: Can't go to drag mode
    // 3: ghost === moving/adding an object: Can't go to drag mode

    this.debug = CONFIG.DEBUG

    this.setUnits()

    this.initCannon()
    this.buildScene()
    this.buildRender()
    this.buildCamera()

    if (this.debug) {
      this.buildHelpers()
    }

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clock = new THREE.Clock()
    this.moveOffset = {
      x: 0,
      y: 0,
      z: 0
    }

    this.createSceneSubjects()

    this.cameraCtrl.rotate('left', this.terrain, false, true)

    this.initGui()
  }

  initGui() {
    this.gui = new dat.GUI()

    this.guiController = {
      lightIntensity: 0.5,
      material: 'toon',
      shininess: 1,
      roughness: 1,
      metalness: 1,
      presets: 3,
      cubeMass: 20,
      ice_color: '#64d5fa',
      terrain_color: '#ffffff'
    }

    this.guiMetalness = this.gui.add(this.guiController, 'metalness', 0.0, 2.0).onChange(this.onGui)
    this.guiRoughness = this.gui.add(this.guiController, 'roughness', 0.0, 2.0).onChange(this.onGui)
    this.guiShininess = this.gui.add(this.guiController, 'shininess', 0, 100).onChange(this.onGui)
    this.gui.add(this.guiController, 'lightIntensity', 0.0, 2.5).onChange(this.onGui)
    this.gui.add(this.guiController, 'material', ['phong', 'standard', 'toon']).onChange(this.onMaterialGui)
    this.gui.add(this.guiController, 'presets', [1, 2, 3]).onChange(this.onPresetsGui)
    this.gui.add(this.guiController, 'cubeMass', 0, 50).onChange(this.onGui)
    this.gui.addColor(this.guiController, 'ice_color').onChange(this.onGui)
    this.gui.addColor(this.guiController, 'terrain_color').onChange(this.onGui)

    this.guiRoughness.domElement.classList.add('disabled')
    this.guiMetalness.domElement.classList.add('disabled')
  }

  initCannon() {
    this.world = world
  }

  buildScene() {
    this.scene = new THREE.Scene()
  }

  buildRender() {
    const { width, height } = this.screenDimensions
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(width, height)
    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true
    this.renderer.gammaFactor = 2.2
  }

  buildCamera() {
    this.cameraCtrl = new CameraController(this.screenDimensions, this.renderer.domElement)
  }

  buildHelpers() {
    const dir = new THREE.Vector3(0, 1, 0)
    // normalize the direction vector (convert to vector of length 1)
    dir.normalize()
    const origin = new THREE.Vector3(0, 0, 0)
    const length = 1
    const hex = 0xff00ff
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex)
    this.scene.add(arrowHelper)
    const gridHelper = new THREE.GridHelper(CONFIG.SCENE_SIZE, CONFIG.SCENE_SIZE / 10)
    this.scene.add(gridHelper)
  }

  createSceneSubjects() {
    this.sceneSubjects = [new Lights(this.scene, this.world), new Terrain(this.scene, this.world)]
    this.lights = this.sceneSubjects[0]
    this.terrain = this.sceneSubjects[1]
  }

  update() {
    const { camera, controls } = this.cameraCtrl
    if (controls && controls.enabled) controls.update() // for damping
    this.raycaster.setFromCamera(this.mouse, camera)

    const elapsedTime = this.clock.getElapsedTime()
    this.world.step(CONFIG.TIMESTEP)
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      this.sceneSubjects[i].update(elapsedTime)
    }

    // if we're in ghost mode and the selected object is on edges
    if (this.mode === 'ghost' && this.mouseInEdge) {
      this.moveSelectedSubject()
      this.cameraCtrl.moveOnEdges(this.mouseInEdge)
    }

    if (this.mesh) {
      this.mesh.rotation.y += toRadian(0.2)
    }

    this.renderer.render(this.scene, camera)
  }

  // EVENTS

  onWindowResize() {
    this.setUnits()
    // Update camera
    this.cameraCtrl.camera.aspect = this.width / this.height
    this.cameraCtrl.camera.updateProjectionMatrix()

    // Update canvas size
    this.renderer.setSize(this.width, this.height)
  }

  onKeydown(event) {
    const elapsedTime = this.clock.getElapsedTime()
    this.bindArrowClick(event.key)
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      if (typeof this.sceneSubjects[i].onKeydown === 'function') {
        this.sceneSubjects[i].onKeydown(event, elapsedTime, this.checkOverlap)
      }
    }
  }

  onMouseMove(event) {
    if (event) {
      this.mouse.x = (event.clientX / this.width) * 2 - 1
      this.mouse.y = -(event.clientY / this.height) * 2 + 1

      if (!this.selectedSubject && this.mode !== 'drag' && this.mode !== 'ghost') {
        // if not in drag or ghost mode

        const hit = this.getNearestObject()
        if (hit) {
          // if mode is neutral
          const subject = this.getSubjectfromMesh(hit.object)
          this.highlightSubject(subject)
        } else {
          this.highlightSubject(false)
        }

        this.mouseInEdge = null
      } else if (this.mode === 'ghost') {
        this.moveSelectedSubject()
        this.detectMouseInEdge(event)
      }
    }
  }

  onMouseDown() {
    const hit = this.getNearestObject()
    if (
      hit.point &&
      (hit.object.geometry instanceof THREE.Geometry || hit.object.geometry instanceof THREE.BufferGeometry)
    ) {
      // eslint-disable-next-line max-len
      const newSelectedSubject = this.sceneSubjects.find(subject =>
        subject.mesh ? subject.mesh.uuid === hit.object.uuid : false
      )
      if (this.selectedSubject) {
        this.unselectObject()
      } else {
        this.selectObject(newSelectedSubject, this.getCurrentPosOnPlane())
      }
    } else if (this.selectedSubject) {
      this.unselectObject()
    }
  }

  onButtonClick(id) {
    switch (id) {
      case 'add-snow-cube':
        this.addShape('cube', 'snow')
        break
      case 'add-ice-cube':
        this.addShape('cube', 'ice')
        break
      case 'add-pyramid':
        this.addShape('pyramid')
        break
      case 'rotate-left':
        this.cameraCtrl.rotate('left', this.terrain)
        break
      case 'rotate-right':
        this.cameraCtrl.rotate('right', this.terrain)
        break
      case 'rotate-top':
        this.cameraCtrl.rotate('top', this.terrain)
        break
      case 'rotate-bottom':
        this.cameraCtrl.rotate('bottom', this.terrain)
        break
      case 'zoom-in':
        this.cameraCtrl.zoom('in')
        break
      case 'zoom-out':
        this.cameraCtrl.zoom('out')
        break
      default:
        break
    }
  }

  onWheel(event) {
    if (event.deltaY < 0) {
      this.cameraCtrl.rotate('left', this.terrain, true)
    } else if (event.deltaY > 0) {
      this.cameraCtrl.rotate('right', this.terrain, true)
    }
  }

  bindArrowClick(key) {
    switch (key) {
      case 'ArrowUp':
        this.move('up')
        break
      case 'ArrowDown':
        this.move('down')
        break
      case 'ArrowRight':
        this.rotate('right')
        break
      case 'ArrowLeft':
        this.rotate('left')
        break
      case 'Escape':
        this.bindEscape()
        break
      default:
        break
    }
  }

  unselectObject(unmove) {
    this.cameraCtrl.resetControls(this.terrain)
    this.setMode()

    if (!unmove) {
      this.selectedSubject.moveToGhost()
    }
    this.selectedSubject.unselect()

    this.terrain.removePositionMarker()

    this.selectedSubject = null
  }

  selectObject(newSelectedSubject, offset) {
    this.setMode('ghost')

    if (this.selectedSubject) {
      this.unselectObject()
    }

    const { x, z } = newSelectedSubject.body.position

    if (offset) {
      this.moveOffset = {
        x: x - offset.x,
        z: z - offset.z
      }
    }

    this.selectedSubject = newSelectedSubject

    this.selectedSubject.select()
    this.terrain.addPositionMarker(this.selectedSubject.body.position)
  }

  findNearestIntersectingObject(objects) {
    const hits = this.raycaster.intersectObjects(objects)
    const closest = hits.length > 0 ? hits[0] : false
    return closest
  }

  getCurrentPosOnPlane() {
    const hit = this.findNearestIntersectingObject([this.terrain.meshes[0]])
    if (hit) return hit.point
    return false
  }

  getNearestObject() {
    const objects = this.getObjectsList()

    return this.findNearestIntersectingObject(objects)
  }

  addShape(shape, material = 'snow') {
    this.setMode('ghost')

    let subject
    switch (shape) {
      case 'cube':
        subject = new Cube(this.scene, this.world, material)
        break
      case 'pyramid':
        subject = new Pyramid(this.scene, this.world, material)
        break
      default:
        break
    }

    this.sceneSubjects.push(subject)
    this.selectObject(subject)
    const pos = this.getCurrentPosOnPlane()
    subject.box.copy(subject.ghost.geometry.boundingBox).applyMatrix4(subject.ghost.matrixWorld)
    const y = 0.5 * (subject.box.max.y - subject.box.min.y)
    subject.moveTo(pos.x, y, pos.z)

    this.terrain.movePositionMarker(pos.x, pos.z)
  }

  move(direction, noMouseMove, elevateScale = CONFIG.ELEVATE_SCALE) {
    if (this.selectedSubject) {
      console.log(this.selectedSubject.ghost.position.y)
      this.moveOffset.y = this.selectedSubject.ghost.position.y + (direction === 'up' ? elevateScale : -elevateScale)
      this.selectedSubject.moveTo(null, this.moveOffset.y, null)
      if (!noMouseMove) {
        this.onMouseMove()
      }
    }
  }

  rotate(direction) {
    if (this.selectedSubject) {
      const angle = direction === 'right' ? Math.PI / 20 : -Math.PI / 20
      const axis = new CANNON.Vec3(0, 1, 0)
      this.selectedSubject.rotate(axis, angle)
    }
  }

  getSubjectfromMesh(mesh) {
    return this.sceneSubjects.find(subject => (subject.mesh ? subject.mesh.uuid === mesh.uuid : false))
  }

  highlightSubject(subject) {
    if (this.highlightedSubject) {
      this.highlightedSubject.unhighlight()
    }

    if (subject) {
      subject.highlight()
      this.highlightedSubject = subject
      this.setMode('highlight')
    } else {
      this.highlightedSubject = null
      if (!this.cameraCtrl.isRotating) this.setMode()
    }
  }

  getObjectsList() {
    return this.sceneSubjects
      .filter(subject => subject.selectable)
      .map(subject => subject.mesh)
      .filter(object => object)
  }

  getObjectBoxesList(filter) {
    return this.sceneSubjects
      .filter(subject => subject.selectable)
      .map(subject => subject.box)
      .filter(box => box)
  }

  detectMouseInEdge(event) {
    const x = event.clientX
    const y = event.clientY

    if (x < this.edgesSize) {
      this.mouseInEdge = 'left'
    } else if (x > this.width - this.edgesSize) {
      this.mouseInEdge = 'right'
    } else if (y < this.edgesSize) {
      this.mouseInEdge = 'top'
    } else if (y > this.height - this.edgesSize) {
      this.mouseInEdge = 'bottom'
    } else {
      this.mouseInEdge = null
    }
  }

  moveSelectedSubject() {
    this.checkCollision()
    const pos = this.getCurrentPosOnPlane()
    this.terrain.movePositionMarker(pos.x + this.moveOffset.x, pos.z + this.moveOffset.z)
    this.selectedSubject.moveTo(pos.x + this.moveOffset.x, null, pos.z + this.moveOffset.z)
  }

  checkCollision() {
    const { ghost, box, mesh } = this.selectedSubject
    const boxes = this.getObjectBoxesList().filter(boxItem => box !== boxItem)
    const fakeBox = new THREE.Box3().copy(box)
    fakeBox.max.y -= CONFIG.ELEVATE_SCALE
    fakeBox.min.y -= CONFIG.ELEVATE_SCALE
    let moveDown = true
    let moveUp = false
    let elevateScale

    if (boxes.length > 0) {
      for (let index = 0; index < boxes.length; index++) {
        const boxItem = boxes[index]

        if (box.intersectsBox(boxItem)) {
          moveUp = true
          elevateScale = boxItem.max.y - box.min.y + 0.01
          break
        } else if (fakeBox.intersectsBox(boxItem)) {
          moveDown = false
        }
      }
    }

    if (moveUp) {
      this.move('up', true, elevateScale)
    } else if (moveDown && fakeBox.min.y > 0) {
      this.move('down', true)
    }
  }

  setMode(mode = '') {
    const { controls } = this.cameraCtrl
    this.canvas.classList.remove('is-dragging')
    this.canvas.classList.remove('is-pointing')

    switch (mode) {
      default:
        controls.enabled = true // reset cameraCtrl.controls
        break
      case 'drag':
        this.canvas.classList.add('is-dragging')
        break
      case 'highlight':
        this.canvas.classList.add('is-pointing')
        controls.enabled = false // disable cameraCtrl.controls
        break
      case 'ghost':
        controls.enabled = false // disable cameraCtrl.controls
        break
    }

    this.mode = mode
  }

  bindEscape() {
    if (this.mode === 'ghost' && this.selectedSubject) {
      if (!this.selectedSubject.mesh.visible) {
        this.deleteObject()
        this.setMode()
        this.terrain.removePositionMarker()
        this.selectedSubject = null
      } else {
        this.unselectObject(true)
      }
    }
  }

  deleteObject() {
    this.selectedSubject.delete()
  }

  setUnits() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.edgesSize = CONFIG.EDGES_PERCENT_SIZE * this.width // based on screen size
  }

  // GUI

  onGui() {
    cubeConfig.MASS = this.guiController.cubeMass
    this.scene.spotLight.intensity = this.guiController.lightIntensity

    let material
    const list = this.getObjectsList()
    list.forEach(mesh => {
      material = mesh.material
    })

    this.updateMaterial(material)

    this.terrain.mesh.material.color = new THREE.Color(this.guiController.terrain_color)
  }

  onMaterialGui() {
    this.guiShininess.domElement.classList.remove('disabled')
    this.guiRoughness.domElement.classList.remove('disabled')
    this.guiMetalness.domElement.classList.remove('disabled')

    let material

    switch (this.guiController.material) {
      case 'phong':
        material = new THREE.MeshPhongMaterial()
        this.guiRoughness.domElement.classList.add('disabled')
        this.guiMetalness.domElement.classList.add('disabled')
        break
      case 'standard':
        material = new THREE.MeshStandardMaterial()
        this.guiShininess.domElement.classList.add('disabled')
        break
      case 'toon':
        material = new THREE.MeshToonMaterial()
        this.guiRoughness.domElement.classList.add('disabled')
        this.guiMetalness.domElement.classList.add('disabled')
        break
    }

    this.updateMaterial(material)
  }

  onPresetsGui() {
    this.guiShininess.domElement.classList.remove('disabled')
    this.guiRoughness.domElement.classList.remove('disabled')
    this.guiMetalness.domElement.classList.remove('disabled')

    let material

    switch (this.guiController.presets) {
      case '1':
        material = new THREE.MeshPhongMaterial()
        this.guiRoughness.domElement.classList.add('disabled')
        this.guiMetalness.domElement.classList.add('disabled')
        this.guiController.shininess = 865
        this.guiController.lightIntensity = 0.4
        this.guiController.material = 'phong'
        break
      case '2':
        material = new THREE.MeshStandardMaterial()
        this.guiShininess.domElement.classList.add('disabled')
        this.guiController.roughness = 0.3
        this.guiController.metalness = 0.3
        this.guiController.lightIntensity = 0.8
        this.guiController.material = 'standard'
        break
      case '3':
        material = new THREE.MeshToonMaterial()
        this.guiRoughness.domElement.classList.add('disabled')
        this.guiMetalness.domElement.classList.add('disabled')
        this.guiController.shininess = 345
        this.guiController.lightIntensity = 0.2
        this.guiController.material = 'toon'
        break
    }

    this.updateMaterial(material)

    for (var i in this.gui.__controllers) {
      this.gui.__controllers[i].updateDisplay()
    }
  }

  onShapesGui() {
    const index = parseInt(this.guiController.shapes) - 1
    this.mesh.geometry = this.shapes[index].geometry
    this.currentShape = index

    this.updateMaterial()
  }

  updateMaterial(material) {
    material.color = new THREE.Color(this.guiController.ice_color)
    material.shininess = this.guiController.shininess
    material.roughness = this.guiController.roughness
    material.metalness = this.guiController.metalness
    material.needsUpdate = true

    const list = this.getObjectsList()

    list.forEach(mesh => {
      mesh.material = material
    })

    this.scene.spotLight.intensity = this.guiController.lightIntensity
  }
}

export default SceneManager
