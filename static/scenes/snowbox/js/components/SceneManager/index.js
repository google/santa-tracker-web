// Config
import CONFIG from './config.js'

// SceneSubjects
import Cube from '../SceneSubjects/Cube/index.js'
import Glue from '../SceneSubjects/Glue/index.js'
import Lights from '../SceneSubjects/Lights/index.js'
import Pyramid from '../SceneSubjects/Pyramid/index.js'
import Terrain from '../SceneSubjects/Terrain/index.js'

// Other
import CameraController from '../CameraController/index.js'

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas

    this.handleGui = this.handleGui.bind(this)

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
    this.offset = 0

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

    this.cameraCtrl.rotate('left', this.terrain)

    // this.initGui()
  }

  initGui() {
    const gui = new dat.GUI()

    this.guiController = {
      displacementScale: 36,
      displacementBias: 210
    }

    gui.add(this.guiController, 'displacementScale', -1000, 1000).onChange(this.handleGui)
    gui.add(this.guiController, 'displacementBias', -1000, 1000).onChange(this.handleGui)
  }

  handleGui() {
    this.mesh.material.displacementScale = this.guiController.displacementScale
    this.mesh.material.displacementBias = this.guiController.displacementBias
  }

  initCannon() {
    this.world = new CANNON.World()
    this.world.gravity.set(0, -10, 0)
    this.world.broadphase = new CANNON.NaiveBroadphase()
    this.world.solver.iterations = 10
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

    this.cameraCtrl.showHelpers()
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
    this.renderer.render(this.scene, camera)

    if (this.mergeInProgress) {
      this.merge()
    }
  }

  // EVENTS

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    // Update camera
    this.cameraCtrl.camera.aspect = width / height
    this.cameraCtrl.camera.updateProjectionMatrix()

    // Update canvas size
    this.renderer.setSize(width, height)
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
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

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
      }
    }

    if (this.selectedSubject) {
      this.checkCollision()
      const pos = this.getCurrentPosOnPlane()
      this.terrain.movePositionMarker(pos.x + this.moveOffset.x, pos.z + this.moveOffset.z)
      this.selectedSubject.moveTo(pos.x + this.moveOffset.x, null, pos.z + this.moveOffset.z)
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
      case 'add-cube':
        this.addShape('cube')
        break
      case 'add-pyramid':
        this.addShape('pyramid')
        break
      case 'add-glue':
        this.addShape('glue')
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
    if (offset) this.cameraCtrl.centerTo(newSelectedSubject.mesh, this.terrain)
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

  addShape(shape) {
    this.setMode('ghost')

    let subject
    switch (shape) {
      case 'cube':
        subject = new Cube(this.scene, this.world)
        break
      case 'pyramid':
        subject = new Pyramid(this.scene, this.world)
        break
      case 'glue':
        subject = new Glue(this.scene, this.world)
        break
      default:
        break
    }

    subject.addListener('merge', this.initMerge.bind(this))
    this.sceneSubjects.push(subject)
    this.selectObject(subject)
    const pos = this.getCurrentPosOnPlane()
    subject.moveTo(pos.x, 1, pos.z)
    subject.moveToGhost()
    this.terrain.movePositionMarker(pos.x, pos.z)
  }

  move(direction, noMouseMove) {
    if (this.selectedSubject) {
      this.moveOffset.y =
        this.selectedSubject.ghost.position.y +
        (direction === 'up' ? CONFIG.ELEVATE_SCALE : -CONFIG.ELEVATE_SCALE) +
        0.01
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

  initMerge(bodyA, bodyB) {
    // Step 1: Get two objects
    const objectA = this.getSubjectfromBody(bodyA)
    const objectB = this.getSubjectfromBody(bodyB)

    // Step 2: Get height of object to be merged
    const heightIncrease = (bodyA.aabb.upperBound.y - bodyB.aabb.lowerBound.y) / 2
    this.mergeData = {
      objectA,
      objectB,
      heightIncrease,
      currentHeightIncrease: 0
    }

    // Step 3: Init Merging
    this.mergeInProgress = true
  }

  getSubjectfromBody(body) {
    return this.sceneSubjects.find(subject => (subject.body ? subject.body.id === body.id : false))
  }

  getSubjectfromMesh(mesh) {
    return this.sceneSubjects.find(subject => (subject.mesh ? subject.mesh.uuid === mesh.uuid : false))
  }

  merge() {
    this.mergeData.currentHeightIncrease += 0.01

    const { objectA, objectB, currentHeightIncrease, heightIncrease } = this.mergeData
    const shapeB = objectB.body.shapes[0]
    shapeB.halfExtents.y += 0.01
    shapeB.updateBoundingSphereRadius()
    shapeB.updateConvexPolyhedronRepresentation()
    objectB.body.updateBoundingRadius()
    objectB.body.updateMassProperties()
    objectB.updateMeshFromBody()

    const shapeA = objectA.body.shapes[0]
    shapeA.halfExtents.y -= 0.01
    shapeA.updateBoundingSphereRadius()
    shapeA.updateConvexPolyhedronRepresentation()
    objectA.body.updateBoundingRadius()
    objectA.body.updateMassProperties()
    objectA.updateMeshFromBody()

    // Check if merge completed
    if (this.mergeData.currentHeightIncrease >= this.mergeData.heightIncrease) {
      this.mergeInProgress = false
      objectA.delete()
      this.sceneSubjects = this.sceneSubjects.filter(subject => subject !== objectA)
    }
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
      this.setMode()
    }
  }

  arrowHelper(vector) {
    var origin = new THREE.Vector3(0, 0, 0)
    var length = 10

    var arrowHelper = new THREE.ArrowHelper(vector, origin, length, 0x00ff00)
    this.scene.add(arrowHelper)
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

  checkCollision() {
    const { ghost, box, mesh } = this.selectedSubject
    const boxes = this.getObjectBoxesList().filter(boxItem => box !== boxItem)
    const fakeBox = new THREE.Box3().copy(box)
    fakeBox.max.y -= CONFIG.ELEVATE_SCALE
    fakeBox.min.y -= CONFIG.ELEVATE_SCALE
    let moveDown = true
    let moveUp = false

    if (boxes.length > 0) {
      for (let index = 0; index < boxes.length; index++) {
        const boxItem = boxes[index]

        if (box.intersectsBox(boxItem)) {
          moveUp = true
          break
        } else if (fakeBox.intersectsBox(boxItem)) {
          moveDown = false
        }
      }
    }

    if (moveUp) {
      this.move('up', true)
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
}

export default SceneManager
