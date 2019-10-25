// Config
import CONFIG from './config.js'

// Utils
import { toRadian } from '../../utils/math.js'
import { getNow } from '../../utils/time.js'
import { outElastic } from '../../utils/ease.js'

class CameraController {
  constructor(screenDimensions, canvas) {
    this.rotationY = 0
    this.rotationXZ = 0
    this.raycaster = new THREE.Raycaster()
    this.canvas = canvas
    this.currentZoom = CONFIG.ZOOM.START

    const { width, height } = screenDimensions
    const aspectRatio = width / height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 1000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(0, CONFIG.POSITION.Y, CONFIG.POSITION.Z)
    this.camera.lookAt(0, 0, 0)
    this.camera.zoom = CONFIG.ZOOM.STEPS[this.currentZoom]
    this.camera.updateProjectionMatrix()

    this.buildControls()
  }

  buildControls() {
    this.controls = new THREE.MapControls(this.camera, this.canvas)
    this.controls.minDistance = CONFIG.CONTROLS.MIN
    this.controls.maxDistance = CONFIG.CONTROLS.MAX
    this.controls.enableKeys = CONFIG.CONTROLS.KEYS
    this.controls.enablePan = CONFIG.CONTROLS.PAN
    this.controls.enableRotate = CONFIG.CONTROLS.ROTATE
    this.controls.enableDamping = CONFIG.CONTROLS.DAMPING
    this.controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR
    this.controls.enableZoom = CONFIG.CONTROLS.ZOOM
  }

  rotate(direction, terrain, wheel, noAnimation) {
    if (this.isRotating) return
    this.controls.enabled = false

    switch (direction) {
      case 'left':
        this.axis = new THREE.Vector3(0, 1, 0)
        this.targetAngle = wheel ? 2 : CONFIG.ROTATION.Y
        this.rotationY += this.targetAngle
        break
      case 'right':
        this.axis = new THREE.Vector3(0, 1, 0)
        this.targetAngle = wheel ? -2 : -CONFIG.ROTATION.Y
        this.rotationY += this.targetAngle
        break
      case 'top':
        this.axis = this.getPerpendicularXZAxisManually()
        this.targetAngle = -CONFIG.ROTATION.XZ
        if (this.rotationXZ + this.targetAngle <= CONFIG.ROTATION.XZ_MAX) {
          // don't rotate if reach max
          return false
        }
        this.rotationXZ += this.targetAngle
        break
      case 'bottom':
        this.axis = this.getPerpendicularXZAxisManually()
        this.targetAngle = CONFIG.ROTATION.XZ
        if (this.rotationXZ + this.targetAngle >= CONFIG.ROTATION.XZ_MIN) {
          // don't rotate if reach min
          return false
        }
        this.rotationXZ += this.targetAngle
        break
    }

    // get look at point
    const intersects = this.getLookAtPointOnTerrain(terrain)
    this.lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0)
    this.lookAt.y = 0 // cleaning up decimals, this value should always be 0

    if (wheel || noAnimation) {
      this.rotateAboutPoint(this.camera, this.lookAt, this.axis, toRadian(this.targetAngle))
    } else {
      // increment value for animation
      this.incrAngle = this.targetAngle / CONFIG.ROTATION.TIME
      this.incrAngleRadian = toRadian(this.incrAngle)
      this.progressAngle = 0
      this.isRotating = true
    }
  }

  animateRotate(now) {

    this.progressAngle += this.incrAngle

    if (this.progressAngle.toFixed(2) !== this.targetAngle.toFixed(2)) {
      this.rotateAboutPoint(this.camera, this.lookAt, this.axis, this.incrAngleRadian)
    } else {
      this.isRotating = false
    }
  }

  zoom(direction, renderer, scene) {
    if (this.isZooming) return

    switch (direction) {
      case 'out':
        if (this.currentZoom + 1 >= CONFIG.ZOOM.STEPS.length) {
          return false
        }
        this.currentZoom++
        break
      case 'in':
        if (this.currentZoom <= 0) {
          return false
        }
        this.currentZoom--
        break
    }

    this.zoomTarget = CONFIG.ZOOM.STEPS[this.currentZoom]

    setTimeout(() => {
      this.zoomOrigin = this.camera.zoom
      this.zoomSpeed = CONFIG.ZOOM.SPEED
      this.zoomStart = getNow()
      this.isZooming = true
    }, 0) // prevent camera jump? Needs to figure why
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

  getLookAtPointOnTerrain(terrain) {
    const worldPos = new THREE.Vector3()
    this.camera.getWorldPosition(worldPos)
    const worldDir = new THREE.Vector3()
    this.camera.getWorldDirection(worldDir)
    this.raycaster.set(worldPos, worldDir)

    return this.raycaster.intersectObjects([terrain.meshes[0]])
  }

  // obj - your object (THREE.Object3D or derived)
  // point - the point of rotation (THREE.Vector3)
  // axis - the axis of rotation (normalized THREE.Vector3)
  // theta - radian value of rotation
  rotateAboutPoint(obj, point, axis, theta) {
    obj.position.sub(point) // remove the offset
    obj.position.applyAxisAngle(axis, theta) // rotate the POSITION
    obj.position.add(point) // re-add the offset

    obj.rotateOnAxis(axis, theta) // rotate the OBJECT
    obj.lookAt(point)
  }

  getPerpendicularXZAxisManually() {
    const finalAxis = new THREE.Vector3(1, 0, 0)
    finalAxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(this.rotationY))

    return finalAxis
  }

  resetControls(terrain) {
    // reset controls where the camera is currently looking at
    const target = this.getLookAtPointOnTerrain(terrain)
    this.controls.target.set(target[0].point.x, target[0].point.y, target[0].point.z) // final pos
  }
}

export default CameraController
