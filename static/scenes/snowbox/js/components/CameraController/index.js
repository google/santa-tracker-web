// Config
import CONFIG from './config.js'

// Utils
import { isTouchDevice } from '../../helpers.js'
import { toRadian } from '../../utils/math.js'
import { getNow } from '../../utils/time.js'
import { outElastic, outExpo } from '../../utils/ease.js'
import SoundManager from '../../managers/SoundManager.js'

class CameraController {
  constructor() {
    this.rotationY = 0
    this.rotationXZ = 0
    this.raycaster = new THREE.Raycaster()
    this.currentZoom = CONFIG.ZOOM.START
    this.zoomSteps = CONFIG.ZOOM.STEPS
    this.rotateXZMin = CONFIG.ROTATE.XZ_MIN
    this.rotateXZMax = CONFIG.ROTATE.XZ_MAX
    this.isTouchDevice = isTouchDevice()
  }

  init(screenDimensions, canvas) {
    const { width, height } = screenDimensions
    const aspectRatio = width / height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 1000
    this.canvas = canvas

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(0, CONFIG.POSITION.Y, CONFIG.POSITION.Z)
    this.camera.lookAt(0, 0, 0)
    this.camera.zoom = CONFIG.ZOOM.STEPS[this.currentZoom]
    this.camera.updateProjectionMatrix()

    this.buildControls()
    this.buildFakeGround()
  }

  buildControls() {
    this.controls = new THREE.MapControls(this.camera, this.canvas)
    this.controls.minDistance = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MIN : CONFIG.CONTROLS.MIN
    this.controls.maxDistance = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MAX : CONFIG.CONTROLS.MAX
    this.controls.minPolarAngle = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MIN_ANGLE : CONFIG.CONTROLS.MIN_ANGLE
    this.controls.maxPolarAngle = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MAX_ANGLE : CONFIG.CONTROLS.MAX_ANGLE
    this.controls.enableKeys = CONFIG.CONTROLS.KEYS
    this.controls.enablePan = CONFIG.CONTROLS.PAN
    this.controls.enableRotate = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.ROTATE : CONFIG.CONTROLS.ROTATE
    this.controls.enableDamping = CONFIG.CONTROLS.DAMPING
    this.controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR
    this.controls.enableZoom = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.ZOOM : CONFIG.CONTROLS.ZOOM
  }

  buildFakeGround() {
    // invisible plane to help camera rotation
    const geometry = new THREE.PlaneGeometry(50, 50)
    const material = new THREE.MeshBasicMaterial({ visible: false, color: 0xff0000 })
    this.fakeGround = new THREE.Mesh(geometry, material)
    this.fakeGround.rotation.x = toRadian(-90)
  }

  rotate(direction, wheel, noAnimation, coef = 1) {
    if (this.isRotating) return
    this.controls.enabled = false

    switch (direction) {
      case 'left':
        this.axis = new THREE.Vector3(0, 1, 0)
        this.targetAngle = wheel ? 2 : CONFIG.ROTATE.Y * coef
        this.rotationY += this.targetAngle
        break
      case 'right':
        this.axis = new THREE.Vector3(0, 1, 0)
        this.targetAngle = wheel ? -2 : -CONFIG.ROTATE.Y * coef
        this.rotationY += this.targetAngle
        break
      case 'top':
        this.axis = this.getPerpendicularXZAxisManually()
        this.targetAngle = -CONFIG.ROTATE.XZ * coef
        if (this.rotationXZ + this.targetAngle <= CONFIG.ROTATE.XZ_MAX) {
          // don't rotate if reach max
          return false
        }
        this.rotationXZ += this.targetAngle
        break
      case 'bottom':
        this.axis = this.getPerpendicularXZAxisManually()
        this.targetAngle = CONFIG.ROTATE.XZ * coef
        if (this.rotationXZ + this.targetAngle >= CONFIG.ROTATE.XZ_MIN) {
          // don't rotate if reach min
          return false
        }
        this.rotationXZ += this.targetAngle
        break
    }

    // get look at point
    const intersects = this.getLookAtPointOnTerrain()
    this.lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0)
    this.lookAt.y = 0 // cleaning up decimals, this value should always be 0
    this.cameraPositionOrigin = this.camera.position.clone()

    if (wheel || noAnimation) {
      this.rotateAboutPoint(this.camera, this.cameraPositionOrigin, this.lookAt, this.axis, toRadian(this.targetAngle))
    } else {

      setTimeout(() => {
        this.isRotating = true
        this.rotateOrigin = 0
        this.rotateTarget = this.targetAngle
        this.rotateSpeed = CONFIG.ROTATE.SPEED
        this.rotateStart = getNow()
      }, 10)
    }
  }

  animateRotate(now) {
    const percent = (now - this.rotateStart) / this.rotateSpeed
    if (percent < 1) {
      const angle = this.rotateOrigin + (this.rotateTarget - this.rotateOrigin) * outExpo(percent)
      this.rotateAboutPoint(this.camera, this.cameraPositionOrigin, this.lookAt, this.axis, toRadian(angle))
    } else {
      this.isRotating = false
    }
  }

  zoom(direction) {
    if (this.isZooming) return

    switch (direction) {
      case 'out':
        if (this.currentZoom + 1 >= CONFIG.ZOOM.STEPS.length) {
          SoundManager.play("snowbox_fail")
          return false
        }
        SoundManager.play("snowbox_zoom_out")
        this.currentZoom++
        break
      case 'in':
        if (this.currentZoom <= 0) {
          SoundManager.play("snowbox_fail")
          return false
        }
        SoundManager.play("snowbox_zoom_in")
        this.currentZoom--
        break
    }

    this.zoomTarget = CONFIG.ZOOM.STEPS[this.currentZoom]
    this.zoomOrigin = this.camera.zoom
    this.zoomSpeed = CONFIG.ZOOM.SPEED
    this.zoomStart = getNow()
    this.isZooming = true
  }

  animateZoom(now) {
    const percent = (now - this.zoomStart) / this.zoomSpeed
    if (percent < 1) {
      this.camera.zoom = this.zoomOrigin + (this.zoomTarget - this.zoomOrigin) * outElastic(percent)
    } else {
      this.isZooming = false
    }

    this.camera.updateProjectionMatrix()
  }

  moveOnEdges(edge) {
    const speed = CONFIG.EDGES_SPEED
    let x
    let z
    const angle = toRadian(this.rotationY)

    // Get xz position based on current rotationY and edge
    switch (edge) {
      case 'top':
        x = -speed * Math.sin(angle)
        z = -speed * Math.cos(angle)
        break
      case 'right':
        x = speed * Math.cos(angle)
        z = -speed * Math.sin(angle)
        break
      case 'bottom':
        x = speed * Math.sin(angle)
        z = speed * Math.cos(angle)
        break
      case 'left':
        x = -speed * Math.cos(angle)
        z = speed * Math.sin(angle)
        break
    }

    this.camera.position.x += x
    this.camera.position.z += z
  }

  getLookAtPointOnTerrain() {
    const worldPos = new THREE.Vector3()
    this.camera.getWorldPosition(worldPos)
    const worldDir = new THREE.Vector3()
    this.camera.getWorldDirection(worldDir)
    this.raycaster.set(worldPos, worldDir)

    return this.raycaster.intersectObjects([this.fakeGround])
  }

  // obj - your object (THREE.Object3D or derived)
  // point - the point of rotation (THREE.Vector3)
  // axis - the axis of rotation (normalized THREE.Vector3)
  // theta - radian value of rotation
  rotateAboutPoint(camera, origin, point, axis, theta) {
    // apply transformation/calculation on a helper, then apply them to the camera
    const helper = new THREE.Object3D()
    helper.position.copy(origin)
    helper.position.sub(point) // remove the offset
    helper.position.applyAxisAngle(axis, theta) // rotate the POSITION
    helper.position.add(point) // re-add the offset

    helper.rotateOnAxis(axis, theta) // rotate the OBJECT

    camera.position.copy(helper.position)
    camera.lookAt(point)

    helper.remove() // clean helper
  }

  getPerpendicularXZAxisManually() {
    const finalAxis = new THREE.Vector3(1, 0, 0)
    finalAxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(this.rotationY))

    return finalAxis
  }

  resetControls() {
    // reset controls where the camera is currently looking at
    const target = this.getLookAtPointOnTerrain()
    if (target[0]) {
      this.controls.target.set(target[0].point.x, target[0].point.y, target[0].point.z) // final pos
    }
  }
}

export default new CameraController()
