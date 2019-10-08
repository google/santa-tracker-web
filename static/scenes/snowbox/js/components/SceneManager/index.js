// Config
import CONFIG from './config.js'

// // SceneSubjects
import Cube from '../SceneSubjects/Cube/index.js'
import Glue from '../SceneSubjects/Glue/index.js'
import Lights from '../SceneSubjects/Lights/index.js'
import Pyramid from '../SceneSubjects/Pyramid/index.js'
import Terrain from '../SceneSubjects/Terrain/index.js'

import snowBox1 from '../../../models/snow_box01.json'
// import snowBox2 from '../../../models/snow_box02.json'

import { randomIntFromInterval, toRadian } from '../../helpers.js'

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas

    this.handleGui = this.handleGui.bind(this)
    this.rotateScene = this.rotateScene.bind(this)

    this.screenDimensions = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    }

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.offset = 0
    this.jointBodyRotation = 0
    this.clock = new THREE.Clock()
    this.radiusCameraYRotate = 50
    this.currentCameraYAngle = 0
    this.rotateYAngle = 45

    this.selectedMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff })

    this.initCannon()
    this.buildScene()
    this.buildRender()
    this.buildCamera()
    this.buildControls()

    if (CONFIG.SHOW_HELPERS) {
      this.buildHelpers()
    }

    this.createSceneSubjects()
    this.createJointBody()

    // Camera helpers
    this.cameraHelper = new THREE.Mesh(new THREE.SphereGeometry(1, 60, 60), new THREE.MeshBasicMaterial({color: 0x00ff00, visible: false}))

    this.cameraHelper.position.x = this.camera.position.x
    this.cameraHelper.position.y = this.camera.position.y
    this.cameraHelper.position.z = this.camera.position.z
    this.scene.add(this.cameraHelper)

    this.cameraHelperBis = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({color: 0x00ff00, visible: true}))
    this.scene.add(this.cameraHelperBis)


    this.rotateCameraBy(this.rotateYAngle, new THREE.Vector3(0,1,0))

    this.camera.updateProjectionMatrix()

    var axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );

    setTimeout(() => {
      var dir = this.camera.getWorldDirection();

      var origin = new THREE.Vector3( 0, 5, 0 );
      var length = 1;
      var hex = 0xffff00;

      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      this.scene.add( arrowHelper );

      console.log(dir.y)
      dir.y = -dir.y
      console.log(dir.y)

      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, 0x00ff00 );
      this.scene.add( arrowHelper );
    }, 1000)




    // this.initGui()
    this.loadCube(() => {
      // models loaded
      console.log('model loaded')
    })
  }

  loadCube(callback) {
    new THREE.MTLLoader()
      .load( '/st/scenes/snowbox/models/snow_box01.mtl', ( materials ) => {

        materials.preload();

        new THREE.OBJLoader()
          .setMaterials( materials )
          .load( '/st/scenes/snowbox/models/snow_box01.obj', ( object ) => {

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
    this.controls.dampingFactor = 0.07;
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
    if (this.controls && this.controls.enabled) this.controls.update() // for damping
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const elapsedTime = this.clock.getElapsedTime()
    this.world.step(CONFIG.TIMESTEP)
    for (let i = 0; i < this.sceneSubjects.length; i++) {
      this.sceneSubjects[i].update(elapsedTime)
    }

    this.renderer.render(this.scene, this.camera)
  }

  // EVENTS

  onWindowResize() {
    const { width, height } = this.canvas
    this.screenDimensions.width = width
    this.screenDimensions.height = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
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
    }
    if (this.selectedSubject) {
      const pos = this.projectOntoPlane()
      this.terrain.movePositionMarker(pos.x, pos.z)
      this.selectedSubject.moveTo(pos.x, null, pos.z)
    }
  }

  onMouseDown() {
    const objects = this.sceneSubjects
      .filter(subject => subject.selectable)
      .map(subject => subject.mesh)
      .filter(object => object)
    const entity = this.findNearestIntersectingObject(objects)
    const pos = entity.point
    if (pos && entity.object.geometry instanceof THREE.Geometry) {
      // eslint-disable-next-line max-len
      const newSelectedSubject = this.sceneSubjects.find(subject =>
        subject.mesh ? subject.mesh.uuid === entity.object.uuid : false
      )
      if (this.selectedSubject) {
        this.unselectObject()
      } else {
        this.selectObject(pos, newSelectedSubject)
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
        this.rotateScene('left')
        break
      case 'rotate-right':
        this.rotateScene('right')
        break
      case 'rotate-top':
        this.rotateScene('top')
        break
      case 'rotate-bottom':
        this.rotateScene('bottom')
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
    this.selectedSubject.unselect()

    this.terrain.removePositionMarker()

    this.offset = 0
    this.jointBodyRotation = 0
    this.selectedSubject = null
  }

  selectObject(pos, newSelectedSubject) {
    if (this.selectedSubject) {
      this.unselectObject()
    }
    this.selectedSubject = newSelectedSubject
    this.selectedSubject.select()
    this.terrain.addPositionMarker(this.selectedSubject.body.position)
  }

  setClickMarker(pos) {
    if (!this.clickMarker) {
      const shape = new THREE.SphereGeometry(0.2, 8, 8)
      this.clickMarker = new THREE.Mesh(
        shape,
        new THREE.MeshLambertMaterial({
          color: 0xff0000
        })
      )
      this.scene.add(this.clickMarker)
    }
    this.clickMarker.visible = true
    this.clickMarker.position.set(pos.x, Math.max(1, pos.y + this.offset), pos.z)
  }

  findNearestIntersectingObject(objects) {
    const hits = this.raycaster.intersectObjects(objects)
    const closest = hits.length > 0 ? hits[0] : false
    return closest
  }

  setScreenPerpCenter(point) {
    // If it does not exist, create a new one
    if (!this.gplane) {
      const planeGeo = new THREE.PlaneGeometry(500, 500)
      this.gplane = new THREE.Mesh(
        planeGeo,
        new THREE.MeshLambertMaterial({
          color: 0x777777,
          transparent: true,
          opacity: 1
        })
      )
      this.scene.add(this.gplane)
    }
    // Center at mouse position
    this.gplane.position.copy(point)
    // Make it face toward the camera
    this.gplane.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  }

  addMouseConstraint(pos, constrainedBody) {
    // The cannon body constrained by the mouse joint
    const { x, y, z } = pos
    // Move the cannon click marker particle to the click position
    this.jointBody.position.set(x, Math.max(1, y + this.offset), z)
    // Create a new constraint
    // The pivot for the jointBody is zero
    this.mouseConstraint = new CANNON.LockConstraint(constrainedBody, this.jointBody)
    // Add the constriant to world
    this.world.addConstraint(this.mouseConstraint)
  }

  removeClickMarker() {
    if (this.clickMarker) {
      this.clickMarker.visible = false
    }
  }

  removeJointConstraint() {
    this.world.removeConstraint(this.mouseConstraint)
    this.mouseConstraint = false
  }

  projectOntoPlane() {
    // project mouse to that plane
    // const hit = this.findNearestIntersectingObject([this.gplane])
    const hit = this.findNearestIntersectingObject([this.terrain.meshes[0]])
    if (hit) return hit.point
    return false
  }

  moveJointToPoint(pos) {
    // Move the joint body to a new position
    this.jointBody.position.set(pos.x, Math.max(1, pos.y + this.offset), pos.z)
    this.mouseConstraint.update()
  }

  addShape(shape) {
    let subject
    switch (shape) {
      case 'cube':
        subject = new Cube(this.scene, this.world, this.cubeGeo, this.cubeMaterial, this.selectedMaterial)
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

    this.sceneSubjects.push(subject)
    this.selectObject(false, subject)
  }

  move(direction) {
    if (this.selectedSubject) {
      const y =
        this.selectedSubject.body.position.y +
        (direction === 'up' ? CONFIG.ELEVATE_SCALE : -CONFIG.ELEVATE_SCALE) +
        0.01
      this.selectedSubject.moveTo(null, y, null)
      this.onMouseMove()
    }
  }

  rotate(direction) {
    if (this.selectedSubject) {
      this.jointBodyRotation = this.jointBodyRotation + (direction === 'right' ? Math.PI / 20 : Math.PI / -20)
      const axis = new CANNON.Vec3(0, 1, 0)
      this.selectedSubject.rotate(axis, this.jointBodyRotation)
    }
  }

  rotateCameraBy(angle, axis) {
    // this.currentCameraYAngle += angle
    // var vector = this.camera.position.clone();
    // console.log(this.camera.position)

    // // cf trigonometry to simulate rotate scene on Y axis
    // const x = this.radiusCameraYRotate * Math.cos(toRadian(this.currentCameraYAngle))
    // const z = this.radiusCameraYRotate * Math.sin(toRadian(this.currentCameraYAngle))
    // this.camera.position.set(x, 40, z)
    console.log(axis)

    this.rotateAboutPoint(this.cameraHelper, new THREE.Vector3(0,0,0), axis, toRadian(angle))
    this.camera.position.copy(this.cameraHelper.position)
    // this.camera.lookAt(0, 0, 0)
  }

  rotateScene(direction) {
    console.log('rotate scene')
    this.controls.enabled = false;

    console.log(this.camera.getWorldDirection())

    switch (direction) {
      case 'left':
        this.rotateCameraBy(this.rotateYAngle, new THREE.Vector3(0,1,0))
        break
      case 'right':
        this.rotateCameraBy(-this.rotateYAngle, new THREE.Vector3(0,1,0))
        break
      case 'top':
        this.rotateCameraBy(-this.rotateYAngle, new THREE.Vector3(0,1,1))
        break
      case 'bottom':
        this.rotateCameraBy(this.rotateYAngle, new THREE.Vector3(0,1,1))
        break
    }

    this.controls.enabled = true;
  }

  // obj - your object (THREE.Object3D or derived)
  // point - the point of rotation (THREE.Vector3)
  // axis - the axis of rotation (normalized THREE.Vector3)
  // theta - radian value of rotation
  // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
  rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if(pointIsWorld){
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
  }
}

export default SceneManager
