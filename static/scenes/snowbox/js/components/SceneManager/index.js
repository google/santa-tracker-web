import { EventEmitter } from '../../event-emitter.js'
import { toRadian } from '../../utils/math.js'
import { darken } from '../../utils/colors.js'
import { isTouchDevice } from '../../helpers.js'

// Config
import CONFIG from './config.js'
import cubeConfig from '../Shapes/Cube/config.js'
import archConfig from '../Shapes/Arch/config.js'
import sphereConfig from '../Shapes/Sphere/config.js'
import treeConfig from '../Shapes/Tree/config.js'

// Managers
import LoaderManager from '../../managers/LoaderManager/index.js'

// SceneSubjects
import Lights from '../SceneSubjects/Lights/index.js'
import Terrain from '../SceneSubjects/Terrain/index.js'

// Shapes
import Cube from '../Shapes/Cube/index.js'
import Arch from '../Shapes/Arch/index.js'
import Tree from '../Shapes/Tree/index.js'
import Sphere from '../Shapes/Sphere/index.js'
import Pyramid from '../Shapes/Pyramid/index.js'

// Other
import '../CannonDebugRenderer/index.js'
import CameraController from '../CameraController/index.js'
import { world } from './world.js'

class SceneManager extends EventEmitter {
  constructor(canvas) {
    super()

    this.debug = CONFIG.DEBUG
    this.isTouchDevice = isTouchDevice()
    this.mode = ''
    // 0: default, can switch to any mode
    // 1: drag === moving camera: Can't click on an object or place an object
    // 2: highlight === hover on an object: Can't go to drag mode
    // 3: move === moving/adding an object: Can't go to drag mode
    // 4: edit === scale/rotate an object: Can't go to drag mode

    this.bind()
  }

  bind() {
    this.onWindowResize = this.onWindowResize.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onWheel = this.onWheel.bind(this)
    this.shapeLoaded = this.shapeLoaded.bind(this)
    this.addShape = this.addShape.bind(this)
    this.onScaleInput = this.onScaleInput.bind(this)
    this.colorObject = this.colorObject.bind(this)
    this.onBodyTouchMove = this.onBodyTouchMove.bind(this)
  }

  init(canvas) {
    this.canvas = canvas

    this.screenDimensions = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    }

    this.preloadShapes()
    this.setUnits()

    this.initCannon()
    this.buildScene()
    this.buildRender()
    this.buildCamera()
    this.buildSceneSubjects()

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clock = new THREE.Clock()
    this.moveOffset = {
      x: 0,
      y: 0,
      z: 0
    }

    this.cameraCtrl.rotate('left', false, true)

    if (this.debug) {
      this.buildHelpers()
      this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.world )
    }

    this.events()
  }

  preloadShapes() {
    LoaderManager.load({name: cubeConfig.NAME, normalMap: cubeConfig.NORMAL_MAP, obj: cubeConfig.OBJ})
    LoaderManager.load({name: archConfig.NAME, normalMap: archConfig.NORMAL_MAP, obj: archConfig.OBJ})
    LoaderManager.load({name: sphereConfig.NAME, normalMap: sphereConfig.NORMAL_MAP, obj: sphereConfig.OBJ})
    LoaderManager.load({name: treeConfig.NAME, normalMap: treeConfig.NORMAL_MAP, obj: treeConfig.OBJ, wrl: treeConfig.WRL})
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

  buildSceneSubjects() {
    this.sceneSubjects = [new Lights(this.scene, this.world), new Terrain(this.scene, this.world)]
    this.lights = this.sceneSubjects[0]
    this.terrain = this.sceneSubjects[1]
  }

  events() {
    window.addEventListener('resize', this.onWindowResize, { passive: true })
    document.addEventListener('keydown', this.onKeydown)

    if (this.isTouchDevice) {
      this.canvas.addEventListener('touchstart', this.onMouseDown)
      document.body.addEventListener('touchend', this.onMouseUp)
      document.body.addEventListener('touchmove', this.onBodyTouchMove)
    } else {
      this.canvas.addEventListener('mousemove', this.onMouseMove)
      this.canvas.addEventListener('mousedown', this.onMouseDown)
      this.canvas.addEventListener('mouseup', this.onMouseUp)
      this.canvas.addEventListener('wheel', this.onWheel)
    }
  }

  // RAF
  update(now) {
    const { camera, controls } = this.cameraCtrl

    if (controls && controls.enabled) controls.update() // for damping

    this.world.step(CONFIG.TIMESTEP)
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      this.sceneSubjects[i].update(this.cameraCtrl.camera.position)
    }

    if (this.cannonDebugRenderer) this.cannonDebugRenderer.update()

    // if we're in ghost mode and the selected object is on edges
    if (this.mode === 'move' && this.mouseInEdge && this.selectedSubject) {
      this.moveSelectedSubject()
      this.cameraCtrl.moveOnEdges(this.mouseInEdge)
    }

    // on camera rotating
    if (this.cameraCtrl.isRotating) {
      this.cameraCtrl.animateRotate(now)

      if (this.mode === 'edit' && this.activeSubject) {
        this.emit('move_camera')
      }
    }

    // on camera zooming
    if (this.cameraCtrl.isZooming) {
      this.cameraCtrl.animateZoom(now)

      if (this.mode === 'edit' && this.activeSubject) {
        this.emit('move_camera')
        this.activeSubject.updateRotatingCircle(this.cameraCtrl.camera.zoom)
      }
    }

    if (this.needsCollisionCheck && this.selectedSubject) {
      this.checkCollision()
      this.needsCollisionCheck = false
    }

    if (this.mode === 'edit' && this.activeSubject && this.activeSubject.isMoving) {
      this.emit('move_camera')
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

  onKeydown(e) {
    e.preventDefault()

    const elapsedTime = this.clock.getElapsedTime()

    switch (e.key) {
      case 'ArrowRight':
        this.rotate('right')
        break
      case 'ArrowLeft':
        this.rotate('left')
        break
      case 'Escape':
        this.bindEscape()
        break
      case 'Backspace':
        this.deleteSelected()
      default:
        break
    }

    for (let i = 0; i < this.sceneSubjects.length; i++) {
      if (typeof this.sceneSubjects[i].onKeydown === 'function') {
        this.sceneSubjects[i].onKeydown(e, elapsedTime, this.checkOverlap)
      }
    }
  }

  onMouseMove(e) {
    e.preventDefault()

    if (this.mouseState === 'down' && this.mode === '') {
      this.setMode('drag')
    }

    if (e) {
      const x = e.clientX || e.touches && e.touches[0].clientX
      const y = e.clientY || e.touches && e.touches[0].clientY

      this.mouse.x = (x / this.width) * 2 - 1
      this.mouse.y = -(y / this.height) * 2 + 1

      if (!this.selectedSubject && this.mode !== 'drag' && this.mode !== 'move' && this.mode !== 'edit') {
        // if not in drag or ghost mode

        const hit = this.getNearestObject()
        if (hit) {
          // if mode is neutral
          const subject = this.getSubjectfromMesh(hit.object)
          if (this.highlightedSubject !== subject) {
            this.highlightSubject(subject)
          }
        } else {
          if (this.highlightedSubject) {
            this.highlightSubject(false)
          }
        }

        this.mouseInEdge = null
      } else if (this.mode === 'move' && this.selectedSubject) {
        this.moveSelectedSubject()
        this.detectMouseInEdge(e)
      }
    }

    if (this.cameraCtrl.camera) this.raycaster.setFromCamera(this.mouse, this.cameraCtrl.camera)
  }

  onMouseDown(e) {
    e.preventDefault()
    if (e.type === 'touchstart') {
      this.mouse.x = (e.targetTouches[0].clientX / this.width) * 2 - 1
      this.mouse.y = -(e.targetTouches[0].clientY / this.height) * 2 + 1
      if (this.cameraCtrl.camera) this.raycaster.setFromCamera(this.mouse, this.cameraCtrl.camera)
    }

    this.mouseState = 'down'

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
        if (this.mode === 'edit') {
          const oldSelectedObject = this.selectedSubject
          this.setMode()
          setTimeout(() => {
            if (oldSelectedObject === newSelectedSubject) {
              this.selectSubject(newSelectedSubject, this.getCurrentPosOnPlane())
            }
          }, 10)
        } else {
          this.unselectSubject()
        }
      } else {
        this.selectSubject(newSelectedSubject, this.getCurrentPosOnPlane())
      }
    } else if (this.selectedSubject && this.mode === 'move') {
      this.unselectSubject()
    } else if (this.mode === 'edit') {
      this.setMode()
    }
  }

  onMouseUp(e) {
    if (e.type !== 'touchend') {
      e.preventDefault()
    }

    if (this.selectedSubject && this.mode === 'move') {
      this.activeSubject = this.selectedSubject
      this.setMode('edit')
    } else {
      this.setMode()
    }

    this.mouseState = 'up'
  }

  onBodyTouchMove(e) {
    e.preventDefault()

    const currentTargetedElement = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY)
    if (
      this.addingShape &&
      this.addingShape !== currentTargetedElement &&
      currentTargetedElement.parentElement != this.addingShape
    ) {
      const { addShape, shapeMaterial } = this.addingShape.dataset
      this.addShape(addShape, shapeMaterial)
      this.addingShape = false
    }

    if (this.mouseState === 'down' && this.mode === '') {
      this.setMode('drag')
    }

    this.onMouseMove(e)
  }

  onWheel(e) {
    if (e.deltaY < 0) {
      this.cameraCtrl.rotate('left', true)
    } else if (e.deltaY > 0) {
      this.cameraCtrl.rotate('right', true)
    }

    if (this.mode === 'edit' && this.activeSubject) {
      this.emit('move_camera')
    }
  }

  // Events from UI
  colorObject(e) {
    const el = e.currentTarget
    if (this.activeSubject) {
      this.activeSubject.mesh.material.color = new THREE.Color(el.dataset.colorObject)
      this.activeSubject.mesh.material.needsUpdate = true

      this.activeSubject.materials.highlight.color = new THREE.Color(darken(el.dataset.colorObject, 15))
      this.activeSubject.materials.highlight.needsUpdate = true
    }
  }

  onScaleInput(e) {
    if (this.activeSubject && !this.selectedSubject) {
      this.selectedSubject = this.activeSubject
      this.selectedSubject.select()
    }

    if (this.selectedSubject) {
      this.selectedSubject.scale(e.target.value)
      this.needsCollisionCheck = true
      this.emit('scale_object')
    }
  }

  rotateObject(el) {
    const direction = el.dataset.rotateObject
    if (this.activeSubject && !this.selectedSubject) {
      this.selectedSubject = this.activeSubject
      this.selectedSubject.select()
    }

    if (this.selectedSubject && this.mode === 'edit') {
      const angle = direction === 'right' || direction === 'bottom' ? toRadian(45) : toRadian(-45)
      this.selectedSubject.rotate(direction, angle, this.cameraCtrl.rotationY)
      this.needsCollisionCheck = true
    }
  }

  addShape(shape, material = 'snow') {
    let subject
    switch (shape) {
      case 'cube':
        subject = new Cube(this.scene, this.world, material)
        break
      case 'pyramid':
        subject = new Pyramid(this.scene, this.world, material)
        break
      case 'arch':
        subject = new Arch(this.scene, this.world, material)
        break
      case 'tree':
        subject = new Tree(this.scene, this.world, material)
        break
      case 'sphere':
        subject = new Sphere(this.scene, this.world, material)
        break
      default:
        break
    }

    subject.load(this.shapeLoaded)
  }

  // others

  unselectSubject(unmove) {
    this.cameraCtrl.resetControls()

    if (!unmove) {
      this.selectedSubject.moveToGhost()
    }
    this.selectedSubject.unselect()

    this.terrain.removePositionMarker()

    this.selectedSubject = null
  }

  selectSubject(newSelectedSubject, offset) {
    this.setMode('move')

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

  shapeLoaded(subject) {
    this.sceneSubjects.push(subject)
    this.selectSubject(subject)
    const pos = this.getCurrentPosOnPlane()
    subject.box.copy(subject.ghost.geometry.boundingBox).applyMatrix4(subject.ghost.matrixWorld)
    const y = 0.5 * (subject.box.max.y - subject.box.min.y)
    subject.moveTo(pos.x, y, pos.z)

    this.terrain.movePositionMarker(pos.x, pos.z)
  }

  move(direction, noMouseMove, elevateScale = CONFIG.ELEVATE_SCALE) {
    if (this.selectedSubject) {
      this.moveOffset.y = this.selectedSubject.ghost.position.y + (direction === 'up' ? elevateScale : -elevateScale)
      this.selectedSubject.moveTo(null, this.moveOffset.y, null)
      if (!noMouseMove) {
        this.onMouseMove()
      }
    }
  }

  getSubjectfromMesh(mesh) {
    return this.sceneSubjects.find(subject => (subject.mesh ? subject.mesh.uuid === mesh.uuid : false))
  }

  highlightSubject(subject, noDelay) {
    if (this.highlightedSubject) {
      this.highlightedSubject.unhighlight()
    }

    if (subject) {
      subject.highlight()
      this.highlightedSubject = subject
      this.setMode('highlight')
    } else if (subject === false) {
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

  detectMouseInEdge(e) {
    const x = e.clientX
    const y = e.clientY

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

  getScreenPosition(obj) {
    const vector = new THREE.Vector3()

    const widthHalf = 0.5 * this.width
    const heightHalf = 0.5 * this.height

    obj.updateMatrixWorld()
    vector.setFromMatrixPosition(obj.matrixWorld)
    vector.project(this.cameraCtrl.camera)

    vector.x = ( vector.x * widthHalf ) + widthHalf
    vector.y = - ( vector.y * heightHalf ) + heightHalf

    return {
        x: vector.x,
        y: vector.y
    };
  }

  moveSelectedSubject() {
    this.checkCollision()
    const pos = this.getCurrentPosOnPlane()
    this.terrain.movePositionMarker(pos.x + this.moveOffset.x, pos.z + this.moveOffset.z)
    this.selectedSubject.moveTo(pos.x + this.moveOffset.x, null, pos.z + this.moveOffset.z)
  }

  checkCollision() {
    // if (this.mode === 'edit') return; // stop on edit
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

    if (box.min.y < 0) {
      moveUp = true
      elevateScale = -box.min.y
    }

    if (moveUp) {
      this.move('up', true, elevateScale)
    } else if (moveDown && fakeBox.min.y > 0) {
      this.move('down', true)
      this.checkCollision()
    }
  }

  setMode(mode = '') {
    const { controls } = this.cameraCtrl
    this.canvas.classList.remove('is-dragging')
    this.canvas.classList.remove('is-pointing')
    // console.log('mode', mode)

    // unselect any object when changing mode
    if (this.selectedSubject) {
      this.unselectSubject()
    }

    if (this.mode === 'edit') {
      // if previous mode was edit, clear edit tool
      if (this.activeSubject) {
        this.activeSubject.unsetEditTools()
        this.emit('leave_edit')
        this.activeSubject = null
      }
    }

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
      case 'move':
        this.canvas.classList.add('is-dragging')
        controls.enabled = false // disable cameraCtrl.controls
        break
      case 'edit':
        if (this.activeSubject) {
          this.activeSubject.setEditTools(this.cameraCtrl.camera.zoom)
          setTimeout(() => {
            this.emit('enter_edit')
          }, 100)
        }
        controls.enabled = false // disable cameraCtrl.controls
        break
    }

    this.mode = mode
  }

  bindEscape() {
    if ((this.mode === 'move' && this.selectedSubject) || (this.mode === 'edit' && this.selectedSubject)) {
      if (!this.selectedSubject.mesh.visible && !this.wireframe) {
        this.deleteObject()
      } else {
        this.unselectSubject(true)
      }
    }
  }

  deleteSelected() {
    if ((this.mode === 'move' && this.selectedSubject) || (this.mode === 'edit' && this.selectedSubject)) {
      this.deleteObject()
    }
  }

  deleteObject() {
    this.sceneSubjects = this.sceneSubjects.filter(subject => subject !== this.selectedSubject)
    this.selectedSubject.delete()
    this.setMode()
    this.terrain.removePositionMarker()
    this.selectedSubject = null
  }

  setUnits() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.edgesSize = CONFIG.EDGES_PERCENT_SIZE * this.width // based on screen size
  }
}

export default new SceneManager()
