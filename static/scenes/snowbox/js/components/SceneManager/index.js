// Config
import CONFIG from './config.js'

// // SceneSubjects
import Cube from '../SceneSubjects/Cube/index.js'
import Glue from '../SceneSubjects/Glue/index.js'
import Lights from '../SceneSubjects/Lights/index.js'
import Pyramid from '../SceneSubjects/Pyramid/index.js'
import Terrain from '../SceneSubjects/Terrain/index.js'

import { toRadian } from '../../utils/math.js'
import { getNow } from '../../utils/time.js'
import { outQuad } from '../../utils/ease.js'

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas

    this.handleGui = this.handleGui.bind(this)
    this.rotateCamera = this.rotateCamera.bind(this)
    this.zoom = this.zoom.bind(this)
    this.animateCameraTo = this.animateCameraTo.bind(this)

    this.screenDimensions = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    }

    this.mode = ''
    // 0: default, can switch to any mode
    // 1: drag === moving camera: Can't click on an object or place an object
    // 2: highlight === hover on an object: Can't go to drag mode
    // 3: ghost === moving/adding an object: Can't go to drag mode

    this.debug = false
    this.offset = 0
    this.jointBodyRotation = 0
    this.radiusCameraYRotate = 50
    this.cameraYAngle = 0
    this.cameraXZAngle = 0
    this.rotationYAngle = 45
    this.rotationXZAngle = 45 / 2
    this.rotationXZAngleMin = 45
    this.rotationXZAngleMax = -46
    this.animateCameraSpeed = 1000
    this.zoomBy = 0.5
    this.zoomMax = 2.5
    this.zoomMin = 0

    this.selectedMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff })
    this.highlightMaterial = new THREE.MeshLambertMaterial({ color: 0xc444c4 })

    this.initCannon()
    this.buildScene()
    this.buildRender()
    this.buildCamera()
    this.buildControls()

    if (CONFIG.SHOW_HELPERS) {
      this.buildHelpers()
    }

    this.raycaster = new THREE.Raycaster()
    this.raycasterCameraRotation = new THREE.Raycaster();
    this.mouse = new THREE.Vector2()
    this.clock = new THREE.Clock()
    this.moveOffset = {
      x: 0,
      y: 0,
      z: 0
    }

    this.createSceneSubjects()
    this.createJointBody()

    // Load models
    this.loadCube(() => {
      this.modelLoaded = true
      // models loaded
      console.log('model loaded')
    })

    // Debug
    if (this.debug) {
      // Camera helpers
      this.cameraHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({color: 0x00ff00, visible: true}))
      this.scene.add(this.cameraHelper)

      for (let i = 0; i < 8; i++) {
        this.cameraYAngle += this.rotationYAngle
        this.getPerpendicularXZAxisManually()
      }
      this.cameraYAngle = 0
    }

    this.rotateCamera('left')

    // this.initGui()
  }

  loadCube(callback) {
    new THREE.MTLLoader()
      .load( './models/snow_box01.mtl', ( materials ) => {

        materials.preload();

        new THREE.OBJLoader()
          .setMaterials( materials )
          .load( './models/snow_box01.obj', ( object ) => {

            this.cubeGeo = object.children[ 0 ].geometry;
            this.cubeMaterial = object.children[ 0 ].material

            callback()

          } );

      } );
  }

  initGui() {
    const gui = new dat.GUI()

    this.guiController = {
      displacementScale: 36,
      displacementBias: 210,
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
    const { width, height } = this.screenDimensions
    const aspectRatio = width / height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 1000
    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(0, 40, this.radiusCameraYRotate)
    this.camera.lookAt(0, 0, 0)
  }

  buildControls() {
    this.controls = new THREE.MapControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 10
    this.controls.maxDistance = 500
    this.controls.enableKeys = false
    this.controls.enablePan = true
    this.controls.enableRotate = false
    this.controls.enableDamping = true;
    this.controls.enabled = true;
    this.controls.dampingFactor = 0.06;
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

  createJointBody() {
    this.jointBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(0.1)
    })
    this.jointBody.collisionFilterGroup = 1
    this.jointBody.collisionFilterMask = 1
    this.world.addBody(this.jointBody)
  }

  update() {
    if (!this.modelLoaded) return
    if (this.controls && this.controls.enabled) this.controls.update() // for damping
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const elapsedTime = this.clock.getElapsedTime()
    this.world.step(CONFIG.TIMESTEP)
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      this.sceneSubjects[i].update(elapsedTime)
    }
    this.renderer.render(this.scene, this.camera)

    if (this.mergeInProgress) {
      this.merge()
    }
  }

  // EVENTS

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

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

      if (!this.selectedSubject && this.mode !== 'drag' && this.mode !== 'ghost') { // if not in drag or ghost mode

        const hit = this.getNearestObject()
        if (hit && this.mode === '') { // if mode is neutral
          const subject = this.getSubjectfromMesh(hit.object)
          this.highlightSubject(subject)
        } else if (!hit && this.mode === 'highlight') {
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
        this.centerCameraTo(newSelectedSubject.mesh)
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
        this.rotateCamera('left')
        break
      case 'rotate-right':
        this.rotateCamera('right')
        break
      case 'rotate-top':
        this.rotateCamera('top')
        break
      case 'rotate-bottom':
        this.rotateCamera('bottom')
        break
      case 'zoom-in':
        this.zoom('in')
        break
      case 'zoom-out':
        this.zoom('out')
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
      default:
        break
    }
  }

  unselectObject() {
    this.setMode()

    this.selectedSubject.moveToGhost()
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

  addShape(shape) {
    this.setMode('ghost')

    let subject
    switch (shape) {
      case 'cube':
        subject = new Cube(this.scene, this.world, this.cubeGeo, this.cubeMaterial, this.selectedMaterial, this.highlightMaterial)
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

  rotateCamera(direction) {
    this.controls.enabled = false;
    let axis
    let angle
    let lookAt

    switch (direction) {
      case 'left':
        axis = new THREE.Vector3(0,1,0)
        angle = this.rotationYAngle
        this.cameraYAngle += angle
        break
      case 'right':
        axis = new THREE.Vector3(0,1,0)
        angle = -this.rotationYAngle
        this.cameraYAngle += angle
        break
      case 'top':
        axis = this.getPerpendicularXZAxisManually()
        angle = -this.rotationXZAngle
        if (this.cameraXZAngle + angle <= this.rotationXZAngleMax) { // don't rotate if reach max
          this.controls.enabled = true
          return false
        }
        this.cameraXZAngle += angle
        break
      case 'bottom':
        axis = this.getPerpendicularXZAxisManually()
        angle = this.rotationXZAngle
        if (this.cameraXZAngle + angle >= this.rotationXZAngleMin) { // don't rotate if reach min
          this.controls.enabled = true
          return false
        }
        this.cameraXZAngle += angle
        break
    }

    const intersects = this.getCenterPointOnTerrain()

    lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0,0,0)
    lookAt.y = 0 // clean up decimals, this value should always be 0

    this.rotateAboutPoint(this.camera, lookAt, axis, toRadian(angle))

    this.controls.enabled = true;
  }

  zoom(direction) {

    switch (direction) {
      case 'in':
        if (this.camera.zoom + this.zoomBy >= this.zoomMax) {
          return false
        }
        this.camera.zoom += this.zoomBy;
        break
      case 'out':
        if (this.camera.zoom - this.zoomBy <= this.zoomMin) {
          return false
        }
        this.camera.zoom -= this.zoomBy;
        break
    }

    this.camera.updateProjectionMatrix()
  }

  centerCameraTo(object) {
    this.controls.enabled = false

    const intersects = this.getCenterPointOnTerrain()

    const distance = intersects.length > 0 ? intersects[0].distance : this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0))
    const startPos = object.position
    startPos.y = 0 // do like the object position was on the ground
    const worldDir = new THREE.Vector3()
    this.camera.getWorldDirection(worldDir)
    const newPos = new THREE.Vector3();
    newPos.addVectors ( startPos, worldDir.negate().multiplyScalar( distance ) );

    // animate camera position in RAF
    this.animateCameraTarget = newPos
    this.animateCameraOrigin = this.camera.position.clone()
    this.animateCameraStart = getNow()
    this.animateCameraTo(this.animateCameraStart) // start RAF Animation for this animation

    this.controls.target.set(object.position.x, object.position.y, object.position.z) // final pos
  }

  animateCameraTo(now) {
    const start = this.animateCameraStart
    const speed = this.animateCameraSpeed
    const origin = this.animateCameraOrigin
    const target = this.animateCameraTarget
    const percent = (now - start) / speed

    if (percent < 1) {
      this.camera.position.x = origin.x + (target.x - origin.x) * outQuad(percent)
      this.camera.position.y = origin.y + (target.y - origin.y) * outQuad(percent)
      this.camera.position.z = origin.z + (target.z - origin.z) * outQuad(percent)

      this.animateCameraToRAF = window.requestAnimationFrame(this.animateCameraTo)
    } else {
      // animation finished
      window.cancelAnimationFrame(this.animateCameraToRAF)
      // this.controls.enabled = true
    }
  }

  getCenterPointOnTerrain() {
    const worldPos = new THREE.Vector3()
    this.camera.getWorldPosition(worldPos)
    const worldDir = new THREE.Vector3()
    this.camera.getWorldDirection(worldDir)
    this.raycasterCameraRotation.set( worldPos, worldDir );

    return this.raycasterCameraRotation.intersectObjects( [this.terrain.meshes[0]] )
  }

  getPerpendicularXZAxisManually() {
    const finalAxis = new THREE.Vector3( 1, 0, 0 );
    finalAxis.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), toRadian( this.cameraYAngle ))

    if (this.debug) this.arrowHelper(finalAxis)

    return finalAxis
  }

  arrowHelper(vector) {
    var origin = new THREE.Vector3( 0, 0, 0 );
    var length = 10;

    var arrowHelper = new THREE.ArrowHelper( vector, origin, length, 0x00ff00 );
    this.scene.add( arrowHelper );
  }

  // obj - your object (THREE.Object3D or derived)
  // point - the point of rotation (THREE.Vector3)
  // axis - the axis of rotation (normalized THREE.Vector3)
  // theta - radian value of rotation
  rotateAboutPoint(obj, point, axis, theta){
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
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
    this.canvas.classList.remove('is-dragging')
    this.canvas.classList.remove('is-pointing')

    switch(mode) {
      default:
        this.controls.enabled = true // reset controls
        break
      case 'drag':
        this.canvas.classList.add('is-dragging')
        break
      case 'highlight':
        this.canvas.classList.add('is-pointing')
        this.controls.enabled = false // disable controls
        break
      case 'ghost':
        this.controls.enabled = false // disable controls
        break
    }

    this.mode = mode
  }
}

export default SceneManager
