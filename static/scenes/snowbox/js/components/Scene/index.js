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

import { toRadian } from '../../utils/math.js'
import { darken } from '../../utils/colors.js'
import isTouchDevice from '../../utils/isTouchDevice.js'
import createCustomEvent from '../../utils/createCustomEvent.js'

// Config
import CONFIG from './config.js'
import cubeConfig from '../Shapes/Cube/config.js'
import archConfig from '../Shapes/Arch/config.js'
import sphereConfig from '../Shapes/Sphere/config.js'
import treeConfig from '../Shapes/Tree/config.js'
import quarterCircleConfig from '../Shapes/QuarterCircle/config.js'
import prismConfig from '../Shapes/Prism/config.js'
import giftConfig from '../Shapes/Gift/config.js'
import snowmanConfig from '../Shapes/Snowman/config.js'
import pyramidConfig from '../Shapes/Pyramid/config.js'

// Managers
import LoaderManager from '../../managers/LoaderManager.js'
import SoundManager from '../../managers/SoundManager.js'

// SceneSubjects
import Lights from '../SceneSubjects/Lights/index.js'
import Sky from '../SceneSubjects/Sky/index.js'
import Mountain from '../SceneSubjects/Mountain/index.js'
import PlaneHelper from '../SceneSubjects/PlaneHelper/index.js'

// Shapes
import Cube from '../Shapes/Cube/index.js'
import Arch from '../Shapes/Arch/index.js'
import Tree from '../Shapes/Tree/index.js'
import Sphere from '../Shapes/Sphere/index.js'
import Pyramid from '../Shapes/Pyramid/index.js'
import QuarterCircle from '../Shapes/QuarterCircle/index.js'
import Prism from '../Shapes/Prism/index.js'
import Gift from '../Shapes/Gift/index.js'
import Snowman from '../Shapes/Snowman/index.js'

// Other
import '../CannonDebugRenderer/index.js'
import CameraController from '../CameraController/index.js'
import { world } from './world.js'
import { SHAPE_COLORS, DEBUG_MODE } from  '../../constants/index.js'

class Scene {
  constructor() {
    this.isTouchDevice = isTouchDevice()
    this.sceneSubjects = []
    this.mode = ''
    // 0: default, can switch to any mode
    // 1: drag === moving camera: Can't click on an object or place an object
    // 2: move === moving/adding an object: Can't go to drag mode
    // 3: edit === scale/rotate an object: Can't go to drag mode
    this.isPinchZooming = false

    this.bind()
  }

  bind() {
    this.onWindowResize = this.onWindowResize.bind(this)
    // this.onKeydown = this.onKeydown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onWheel = this.onWheel.bind(this)
    this.shapeLoaded = this.shapeLoaded.bind(this)
    this.addShape = this.addShape.bind(this)
    this.onScaleInput = this.onScaleInput.bind(this)
    this.colorSubject = this.colorSubject.bind(this)
    this.onCanvasTouchMove = this.onCanvasTouchMove.bind(this)
  }

  init(canvas) {
    this.canvas = canvas

    this.screenDimensions = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    }

    this.ui = {
      module: document.body.querySelector('#module-snowglobe'),
      toolbar: document.body.querySelector('[toolbar]'),
      UI: document.body.querySelector('.ui'),
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
      z: 0,
    }

    this.scene.add(CameraController.fakeGround)
    CameraController.rotate('left', true, 45)

    if (DEBUG_MODE) {
      this.buildHelpers()
      this.cannonDebugRenderer = new THREE.CannonDebugRenderer(this.scene, this.world)
    }

    this.events()
  }

  preloadShapes() {
    LoaderManager.load({ name: cubeConfig.NAME, normalMap: cubeConfig.NORMAL_MAP, obj: cubeConfig.OBJ })
    LoaderManager.load({ name: giftConfig.NAME, obj: giftConfig.OBJ })
    LoaderManager.load({ name: archConfig.NAME, normalMap: archConfig.NORMAL_MAP, obj: archConfig.OBJ })
    LoaderManager.load({ name: prismConfig.NAME, normalMap: prismConfig.NORMAL_MAP, obj: prismConfig.OBJ })
    LoaderManager.load({ name: sphereConfig.NAME, normalMap: sphereConfig.NORMAL_MAP, obj: sphereConfig.OBJ })
    LoaderManager.load({ name: treeConfig.NAME, normalMap: treeConfig.NORMAL_MAP, obj: treeConfig.OBJ })
    LoaderManager.load({ name: pyramidConfig.NAME, normalMap: pyramidConfig.NORMAL_MAP, obj: pyramidConfig.OBJ })
    LoaderManager.load({ name: quarterCircleConfig.NAME, normalMap: quarterCircleConfig.NORMAL_MAP, obj: quarterCircleConfig.OBJ, wrl: quarterCircleConfig.WRL })
    LoaderManager.load({ name: snowmanConfig.NAME, normalMap: snowmanConfig.NORMAL_MAP, map: snowmanConfig.MAP, obj: snowmanConfig.OBJ })
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
      alpha: true,
    })
    this.renderer.setClearColor(0x000000, 1)
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(width, height)
    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true
    this.renderer.gammaFactor = 2.2
  }

  buildCamera() {
    CameraController.init(this.screenDimensions, this.renderer.domElement)
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
    this.lights = new Lights(this.scene)
    this.sky = new Sky(this.scene)
    this.mountain = new Mountain(this.scene, this.world, this.sceneSubjects)
    this.planeHelper = new PlaneHelper(this.scene).mesh
  }

  events() {
    window.addEventListener('resize', this.onWindowResize, { passive: true })
    // document.addEventListener('keydown', this.onKeydown)

    if (this.isTouchDevice) {
      this.canvas.addEventListener('touchstart', this.onMouseDown)
      document.body.addEventListener('touchend', this.onMouseUp)
      // this.canvas.addEventListener('touchcancel', this.onMouseUp)
      document.body.addEventListener('touchmove', this.onMouseMove)
      // only on canvas, not document, and if not edit mode
      this.canvas.addEventListener('touchmove', this.onCanvasTouchMove, false)
    } else {
      this.canvas.addEventListener('mousemove', this.onMouseMove)
      this.canvas.addEventListener('mousedown', this.onMouseDown)
      this.canvas.addEventListener('mouseup', this.onMouseUp)
      this.canvas.addEventListener('wheel', this.onWheel)
    }
  }

  // RAF
  update(now) {
    // Camera
    const { camera, controls } = CameraController

    if (controls && controls.enabled && controls.target) controls.update() // for damping

    // if we're in ghost mode and the selected object is on edges
    // if (this.mode === 'move' && this.mouseInEdge && this.selectedSubject) {
    //   CameraController.moveOnEdges(this.mouseInEdge)
    // }

    // on camera rotating
    if (CameraController.isRotating) {
      CameraController.animateRotate(now)
    }

    // on camera zooming
    if (CameraController.isZooming) {
      CameraController.animateZoom(now)
    }

    if (this.mode === 'edit' && this.activeSubject) {
      if (CameraController.isMoving || this.activeSubject.isMoving) {
        window.dispatchEvent(createCustomEvent('UPDATE_EDIT'))
      }

      if (CameraController.isZooming) {
        this.activeSubject.updateRotatingCircle(CameraController.camera.zoom)
      }
    }

    // World
    this.world.step(CONFIG.TIMESTEP)

    for (let i = 0; i < this.sceneSubjects.length; i++) {
      if (this.sceneSubjects[i].update) {
        this.sceneSubjects[i].update(CameraController.camera.position)
      }
    }

    if (this.cannonDebugRenderer) this.cannonDebugRenderer.update()

    // Render
    this.renderer.render(this.scene, camera)
  }

  // EVENTS

  onWindowResize() {
    this.setUnits()
    // Update camera
    CameraController.camera.aspect = this.width / this.height
    CameraController.camera.updateProjectionMatrix()

    // Update canvas size
    this.renderer.setSize(this.width, this.height)
  }

  onMouseMove(e) {
    if (e.type !== 'touchmove') {
      e.preventDefault()
    }

    if (this.mouseState === 'down' && this.mode === '') {
      this.setMode('drag')
    }

    if (e) {
      const x = e.clientX || e.touches && e.touches[0].clientX
      const y = e.clientY || e.touches && e.touches[0].clientY

      this.mouse.x = (x / this.width) * 2 - 1
      this.mouse.y = -(y / this.height) * 2 + 1

      this.isInCanvas = this.mouse.y > -1 && this.mouse.y < 1

      if (this.selectedSubject && this.isSelectingMouseDown && !this.selectedSubject.ghost && this.mode !== 'edit') {
        this.selectedSubject.showGhost()
      }

      if (!this.selectedSubject && this.mode !== 'drag' && this.mode !== 'move') {
        // if not in drag or ghost mode
        const hit = this.getNearestObject()
        if (hit) {
          const subject = this.getSubjectfromMesh(hit.object.parent)
          this.highlightSubject(subject)
        } else {
          this.highlightSubject(false)
        }

        this.mouseInEdge = null
      } else if (this.mode === 'move' && this.selectedSubject && this.isInCanvas) {
        this.moveSelectedSubject()
        this.checkCollision()
        // if (this.canDetectMouseInEdge) {
        //   this.detectMouseInEdge(e)
        // }
      }
    }

    if (CameraController.camera) this.raycaster.setFromCamera(this.mouse, CameraController.camera)
  }

  onMouseDown(e) {
    // For touch events only
    if (e.type === 'touchstart') {
      this.detectTouches(e)
    } else {
      e.preventDefault()
    }

    this.mouseState = 'down'

    const hit = this.getNearestObject()
    if (
      hit.point &&
      (hit.object.geometry instanceof THREE.Geometry || hit.object.geometry instanceof THREE.BufferGeometry)
    ) {
      // eslint-disable-next-line max-len
      const newSelectedSubject = this.sceneSubjects.find(subject =>
        subject.mesh ? subject.mesh.uuid === hit.object.parent.uuid : false
      )

      this.selectSubject(newSelectedSubject)

      clearTimeout(this.isSelectingMouseDownTimeOut)
      this.isSelectingMouseDownTimeOut = setTimeout(() => {
        this.isSelectingMouseDown = true
      }, 200) // prevent glitch if mousedown, move and mouseup very fast

    } else {
      this.setMode()
    }
  }

  onMouseUp(e) {
    if (e.type !== 'touchend') {
      e.preventDefault()
    } else if (this.selectedSubject && this.mouseState !== 'down' && this.mode !== 'edit' && this.isInCanvas) {
      this.unselectSubject()
      this.setMode()
    }

    if (this.selectedSubject && this.mode === 'move' && this.mouseState === 'down' && !this.isAddingShape) {
      this.activeSubject = this.selectedSubject
      this.setMode('edit')
    } else if (!this.isTouchDevice) {
      this.setMode()
    }

    this.mouseState = 'up'

    if (this.isPinchZooming) {
      this.isPinchZooming = false
    }

    this.isAddingShape = false
  }

  onWheel(e) {
    if (CameraController.isZooming || CameraController.isRotating) return
    CameraController.isMoving = true

    if (e.deltaY < 0) {
      CameraController.rotate('left', true, 2)
    } else if (e.deltaY > 0) {
      CameraController.rotate('right', true, 2)
    }

    clearTimeout(this.onWheelTimeout)
    this.onWheelTimeout = setTimeout(() => {
      CameraController.isMoving = false
    }, 1000)
  }

  detectTouches(e) {
    this.mouse.x = (e.targetTouches[0].clientX / this.width) * 2 - 1
    this.mouse.y = -(e.targetTouches[0].clientY / this.height) * 2 + 1
    if (CameraController.camera) this.raycaster.setFromCamera(this.mouse, CameraController.camera)

    if (this.mode === 'edit' || this.mode === 'move') return

    // Detect pinch (if 2 fingers)
    if (e.touches.length === 2) {
      this.isPinchZooming = true
      return
    }

    this.xTouchStart = e.touches[0].clientX
    this.yTouchStart = e.touches[0].clientY
  }

  onCanvasTouchMove(e) {
    if (this.mode === 'edit' || this.mode === 'move') return

    if (this.isPinchZooming) { // if 2 fingers
      const distancePinch = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)

      if (distancePinch > this.lastDistancePinch) {
        // zoom in
        CameraController.zoom('in', true, 2)
      } else {
        // zoom out
        CameraController.zoom('out', true, 2)
      }

      this.lastDistancePinch = distancePinch
      return
    }

    const xUp = e.touches[0].clientX
    const yUp = e.touches[0].clientY

    const xDiff = this.xTouchStart - xUp
    const yDiff = this.yTouchStart - yUp

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        CameraController.rotate('left', true, 2.2)
      } else {
        CameraController.rotate('right', true, 2.2)
      }
    } else {
      if (yDiff > 0) {
        CameraController.rotate('bottom', true, 0.88)
      } else {
        CameraController.rotate('top', true, 0.88)
      }
    }

    this.xTouchStart = e.touches[0].clientX
    this.yTouchStart = e.touches[0].clientY
  }

  // Events from UI
  colorSubject(e) {
    const el = e.currentTarget
    const { colorSubject } = el.dataset
    if (this.activeSubject) {
      const threeColor = new THREE.Color(colorSubject)
      const threeHighlightedColor = new THREE.Color(darken(colorSubject, 15))

      for (let i = 0; i < this.activeSubject.mesh.children.length; i++) {
        const child = this.activeSubject.mesh.children[i]
        if (this.activeSubject.name === 'gift') {
          // only change the last material color for gifts
          if (i === 4) {
            child.material.color = threeColor
          }
        } else {
          child.material.color = threeColor
        }
      }

      this.activeSubject.materials.default.color = threeColor
      this.activeSubject.materials.highlight.color = threeHighlightedColor

      SHAPE_COLORS[this.activeSubject.name].default = threeColor
      SHAPE_COLORS[this.activeSubject.name].highlight = threeHighlightedColor
      SoundManager.play('snowbox_pick_color')
    }
  }

  onScaleInput(e) {
    if (this.activeSubject && !this.selectedSubject) {
      this.selectedSubject = this.activeSubject
      this.selectedSubject.select()
    }

    if (this.selectedSubject) {
      this.selectedSubject.scale(e.target.value)
      this.checkCollision(true)
    }
    SoundManager.play('snowbox_scale', parseFloat((e.target.value - 5)/35))
  }

  rotateObject(el) {
    const direction = el.dataset.rotateObject
    if (this.activeSubject && !this.selectedSubject) {
      this.selectedSubject = this.activeSubject
      this.selectedSubject.select()
    }

    if (this.selectedSubject && this.mode === 'edit') {
      const angle = direction === 'right' || direction === 'bottom' ? toRadian(45) : toRadian(-45)
      this.selectedSubject.rotate(direction, angle, CameraController.rotationY)
      this.checkCollision(true)
    }
    SoundManager.play('snowbox_rotate')
  }

  addShape(shape, material = 'snow') {
    if (this.mode === 'move') return
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
      case 'quarter-circle':
        subject = new QuarterCircle(this.scene, this.world, material)
        break
      case 'prism':
        subject = new Prism(this.scene, this.world, material)
        break
      case 'gift':
        subject = new Gift(this.scene, this.world, material)
        break
      case 'snowman':
        subject = new Snowman(this.scene, this.world, material)
        break
      default:
        break
    }

    subject.load(this.shapeLoaded)

    // prevent moving camera just after adding a shape
    // this.canDetectMouseInEdge = false
    // clearTimeout(this.canDetectMouseInEdgeTimeout)
    // this.canDetectMouseInEdgeTimeout = setTimeout(() => {
    //   this.canDetectMouseInEdge = true
    // }, 2000)
  }

  // others
  shapeLoaded(subject) {
    this.isAddingShape = true
    this.sceneSubjects.push(subject)
    this.selectSubject(subject, true)
    // subject.box.copy(subject.ghost.geometry.boundingBox).applyMatrix4(subject.ghost.matrixWorld)
    const box = new THREE.Box3().setFromObject(subject.ghost)
    this.planeHelper.position.y = subject.size / 2 * (box.max.y - box.min.y) // add half Y +
  }

  unselectSubject(unmove) {
    CameraController.resetControls()

    if (!unmove && this.selectedSubject.ghost) {
      this.selectedSubject.moveToGhost()
    }
    //wakeupBodies
    this.wakeUpBodies()
    this.selectedSubject.unselect()

    this.mountain.removePositionMarker()

    this.selectedSubject = null

    SoundManager.play('snowbox_unselect_subject')
  }

  selectSubject(newSelectedSubject, fromToolbar = false) {
    this.setMode('move')

    this.selectedSubject = newSelectedSubject
    this.selectedSubject.select(this.isAddingShape)
    const { position } = this.selectedSubject.body

    this.moveOffset.y = 0 // reset y

    if (fromToolbar) {
      this.moveOffset.x = 0
      this.moveOffset.z = 0
      this.mountain.addPositionMarker({
        x: 100, // hide it
        y: 100,
        z: 100,
      })
    } else {
      // don't play sound if dragging from toolbar
      SoundManager.play('snowbox_select_subject')
      const box = new THREE.Box3().setFromObject(this.selectedSubject.mesh)
      // update planeHelper Y
      this.planeHelper.position.y = (box.max.y - box.min.y) / 2 // or position.y
      this.renderer.render(this.scene, CameraController.camera) // check if we really need that
      const posPlaneHelper = this.getCurrentPosOnPlaneHelper()
      this.moveOffset.x = -(posPlaneHelper.x - position.x)
      this.moveOffset.z = -(posPlaneHelper.z - position.z)
      this.mountain.addPositionMarker({
        x: posPlaneHelper.x + this.moveOffset.x,
        y: this.planeHelper.position.y + this.moveOffset.y,
        z: posPlaneHelper.z + this.moveOffset.z,
      })
    }
  }

  moveSelectedSubject() {
    const posPlaneHelper = this.getCurrentPosOnPlaneHelper()

    if (posPlaneHelper) {
      const x = posPlaneHelper.x + this.moveOffset.x
      const z = posPlaneHelper.z + this.moveOffset.z
      const y = this.planeHelper.position.y + this.moveOffset.y
      this.selectedSubject.moveTo(x, y, z)

      this.mountain.movePositionMarker(x, z)
    }
  }

  findNearestIntersectingObject(objects) {
    const hits = this.raycaster.intersectObjects(objects, true)
    const closest = hits.length > 0 ? hits[0] : false
    return closest
  }

  getCurrentPosOnPlaneHelper() {
    const intersects = []
    this.planeHelper.raycast(this.raycaster, intersects)
    if (intersects.length > 0) {
      const { point } = intersects[0]

      return point
    }
    return false
  }

  getNearestObject() {
    const objects = this.getObjectsList()

    return this.findNearestIntersectingObject(objects)
  }

  getSubjectfromMesh(mesh) {
    return this.sceneSubjects.find(subject => (subject.mesh ? subject.mesh.uuid === mesh.uuid : false))
  }

  highlightSubject(subject) {
    if (subject && subject !== this.highlightedSubject) {
      // clean previous subjects
      this.cleanHighlightedSubjects()
      this.canvas.classList.add('is-pointing')
      subject.highlight()
      this.highlightedSubject = subject
      SoundManager.highlightShape(subject)
    } else if (!subject) {
      if (this.highlightedSubject && this.highlightedSubject !== this.activeSubject) {
        this.highlightedSubject.unhighlight()
      }
      this.canvas.classList.remove('is-pointing')
      this.highlightedSubject = null
    }
  }

  cleanHighlightedSubjects() {
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      if (this.sceneSubjects[i].unhighlight && this.sceneSubjects[i] !== this.activeSubject) {
        this.sceneSubjects[i].unhighlight()
      }
    }
  }

  getObjectsList(collidable = false) {
    return this.sceneSubjects
      .filter(subject => {
        if (collidable) {
          return subject.selectable || subject.collidable
        } else {
          return subject.selectable
        }
      })
      .map(subject => subject.mesh)
      .filter(object => object)
  }

  getObjectBoxesList(filter) {
    return this.sceneSubjects
      .filter(subject => subject !== this.selectedSubject && subject.selectable)
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
    vector.project(CameraController.camera)

    vector.x = (vector.x * widthHalf) + widthHalf
    vector.y = -(vector.y * heightHalf) + heightHalf

    return {
      x: vector.x,
      y: vector.y,
    }
  }

  checkCollision(isEditing = false) {
    // if (this.mode === 'edit') return; // stop on edit
    // const { box } = this.selectedSubject
    let box = new THREE.Box3().setFromObject(this.selectedSubject.ghost)
    const objects = this.getObjectsList(true).filter(subject => subject !== this.selectedSubject.mesh)
    const sizeY = box.max.y - box.min.y // get size of current object in Y
    // go boxHelper is equal to the ground position of the current box
    const boxHelper = new THREE.Box3().copy(box)
    boxHelper.max.y = sizeY
    boxHelper.min.y = 0

    let elevate = 0
    const offsetDetectionY = 0.01

    const detectCollision = () => {
      let collision = false

      for (let index = 0; index < objects.length; index++) {
        const boxItem = new THREE.Box3().setFromObject(objects[index])

        if (boxHelper.intersectsBox(boxItem)) {
          // get hightest Ypos of collision objects
          elevate = Math.max(elevate, boxItem.max.y)
          collision = true
        }
      }

      if (collision) {
        // move boxHelper up and do the test again
        boxHelper.max.y = elevate + sizeY
        boxHelper.min.y = elevate + offsetDetectionY // need that to stop detecting collision when movnig up
        detectCollision()
      } else {
        // if no more collision, move up the object (update moveOffset)
        this.moveOffset.y = boxHelper.min.y - 0.05 * this.selectedSubject.scaleFactor
        if (isEditing) {
          // move ghost
          this.selectedSubject.moveTo(null, sizeY / 2 + this.moveOffset.y, null)
          box = new THREE.Box3().setFromObject(this.selectedSubject.ghost)
          // check ground collision after update position
          if (box.min.y < 0) {
            this.moveOffset.y += -(box.min.y)
            this.selectedSubject.moveTo(null, sizeY / 2 + this.moveOffset.y, null)
          }
        }
      }
    }

    detectCollision()
  }

  setMode(mode = '') {
    const { controls } = CameraController
    this.canvas.classList.remove('is-dragging')
    this.canvas.classList.remove('is-pointing')

    // unselect any object when changing mode
    if (this.selectedSubject) {
      this.unselectSubject()
    }

    if (this.mode === 'edit' && mode !== 'edit') {
      // if previous mode was edit, clear edit tool
      if (this.activeSubject) {
        this.activeSubject.deleteRotateCircle()
        window.dispatchEvent(createCustomEvent('LEAVE_EDIT'))
        this.activeSubject = null
      }
    }

    switch (mode) {
      default:
        this.cleanHighlightedSubjects()
        controls.enabled = true // reset cameraCtrl.controls
        break
      case 'drag':
        this.cleanHighlightedSubjects()
        this.canvas.classList.add('is-dragging')
        break
      case 'move':
        this.canvas.classList.add('is-dragging')
        controls.enabled = false // disable cameraCtrl.controls
        break
      case 'edit':
        this.cleanHighlightedSubjects()
        if (this.activeSubject) {
          this.activeSubject.createRotateCircle(CameraController.camera.zoom)
          window.dispatchEvent(createCustomEvent('ENTER_EDIT'))
          this.activeSubject.highlight()
        }
        controls.enabled = false // disable cameraCtrl.controls
        break
    }

    this.mode = mode
  }

  deleteSelected() {
    if ((this.mode === 'move' && this.selectedSubject) || (this.mode === 'edit' && this.selectedSubject)) {
      this.deleteObject()
    }
  }

  deleteObject() {
    this.sceneSubjects = this.sceneSubjects.filter(subject => subject !== this.selectedSubject)
    if (this.selectedSubject) {
      this.selectedSubject.delete()
    } else if (this.activeSubject) {
      this.activeSubject.delete()
    }
    this.selectedSubject = null
    this.activeSubject = null
    this.setMode()
    this.mountain.removePositionMarker()
  }

  wakeUpBodies() {
    const bodies = this.sceneSubjects.filter(subject => subject.selectable || subject.collidable)
      .map(subject => subject.body)

    for (let i = 0; i < bodies.length; i++) {
      // wake up all bodies
      if (bodies[i].sleepState > 0) {
        bodies[i].wakeUp()
      }
    }
  }

  setUnits() {
    this.ui.UI.style.height = `${window.innerHeight}px`
    this.ui.module.style.height = `${window.innerHeight}px`

    this.width = this.ui.module.offsetWidth // get iOS toolbar size
    this.height = this.ui.module.offsetHeight - this.ui.toolbar.offsetHeight

    this.edgesSize = CONFIG.EDGES_PERCENT_SIZE * this.width // based on screen size
  }
}

export default new Scene()
