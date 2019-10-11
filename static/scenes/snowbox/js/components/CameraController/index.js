// Config
import CONFIG from './config.js'

// Utils
import { toRadian } from '../../utils/math.js'
import { getNow } from '../../utils/time.js'
import { outQuad } from '../../utils/ease.js'

class CameraController {
  constructor(screenDimensions, canvas) {
    this.cameraYAngle = 0
    this.cameraXZAngle = 0
    this.raycaster = new THREE.Raycaster()
    this.canvas = canvas

    this.animateTo = this.animateTo.bind(this)

    const { width, height } = screenDimensions
    const aspectRatio = width / height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 1000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(0, CONFIG.RADIUS_CAMERA_Y_ROTATE, CONFIG.RADIUS_CAMERA_Z_ROTATE)
    this.camera.lookAt(0, 0, 0)

    this.buildControls()
  }

  buildControls() {
    this.controls = new THREE.MapControls(this.camera, this.canvas)
    this.controls.minDistance = 10
    this.controls.maxDistance = 500
    this.controls.enableKeys = false
    this.controls.enablePan = true
    this.controls.enableRotate = false
    this.controls.enableDamping = true
    this.controls.enabled = true
    this.controls.dampingFactor = 0.06
  }

  rotate(direction, terrain) {
    this.controls.enabled = false

    let axis
    let angle
    let lookAt

    switch (direction) {
      case 'left':
        axis = new THREE.Vector3(0, 1, 0)
        angle = CONFIG.ROTATION_Y_ANGLE
        this.cameraYAngle += angle
        break
      case 'right':
        axis = new THREE.Vector3(0, 1, 0)
        angle = -CONFIG.ROTATION_Y_ANGLE
        this.cameraYAngle += angle
        break
      case 'top':
        axis = this.getPerpendicularXZAxisManually()
        angle = -CONFIG.ROTATION_XZ_ANGLE
        if (this.cameraXZAngle + angle <= CONFIG.ROTATION_XZ_ANGLE_MAX) {
          // don't rotate if reach max
          return false
        }
        this.cameraXZAngle += angle
        break
      case 'bottom':
        axis = this.getPerpendicularXZAxisManually()
        angle = CONFIG.ROTATION_XZ_ANGLE
        if (this.cameraXZAngle + angle >= CONFIG.ROTATION_XZ_ANGLE_MIN) {
          // don't rotate if reach min
          return false
        }
        this.cameraXZAngle += angle
        break
    }

    const intersects = this.getLookAtPointOnTerrain(terrain)

    lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0)
    lookAt.y = 0 // clean up decimals, this value should always be 0
    this.rotateAboutPoint(this.camera, lookAt, axis, toRadian(angle))

    this.controls.enabled = true
  }

  zoom(direction) {
    switch (direction) {
      case 'in':
        if (this.camera.zoom + CONFIG.ZOOM_BY >= CONFIG.ZOOM_MAX) {
          return false
        }
        this.camera.zoom += CONFIG.ZOOM_BY
        break
      case 'out':
        if (this.camera.zoom - CONFIG.ZOOM_BY <= CONFIG.ZOOM_MIN) {
          return false
        }
        this.camera.zoom -= CONFIG.ZOOM_BY
        break
    }

    this.camera.updateProjectionMatrix()
  }

  centerTo(object, terrain) {
    this.controls.enabled = false

    const intersects = this.getLookAtPointOnTerrain(terrain)

    const distance =
      intersects.length > 0 ? intersects[0].distance : this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0))
    const startPos = object.position
    startPos.y = 0 // do like the object position was on the ground
    const worldDir = new THREE.Vector3()
    this.camera.getWorldDirection(worldDir)
    const newPos = new THREE.Vector3()
    newPos.addVectors(startPos, worldDir.negate().multiplyScalar(distance))

    // animate camera position in RAF
    this.animateCameraTarget = newPos
    this.animateCameraOrigin = this.camera.position.clone()
    this.animateCameraStart = getNow()
    this.animateTo(this.animateCameraStart) // start RAF Animation for this animation

    this.controls.target.set(object.position.x, object.position.y, object.position.z) // final pos
  }

  animateTo(now) {
    const start = this.animateCameraStart
    const speed = CONFIG.ANIMATE_CAMERA_SPEED
    const origin = this.animateCameraOrigin
    const target = this.animateCameraTarget
    const percent = (now - start) / speed

    if (percent < 1) {
      this.camera.position.x = origin.x + (target.x - origin.x) * outQuad(percent)
      this.camera.position.y = origin.y + (target.y - origin.y) * outQuad(percent)
      this.camera.position.z = origin.z + (target.z - origin.z) * outQuad(percent)

      this.animateToRAF = window.requestAnimationFrame(this.animateTo)
    } else {
      // animation finished
      window.cancelAnimationFrame(this.animateToRAF)
      this.controls.enabled = true
    }
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
  }

  getPerpendicularXZAxisManually() {
    const finalAxis = new THREE.Vector3(1, 0, 0)
    finalAxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(this.cameraYAngle))

    if (this.debug) this.arrowHelper(finalAxis)

    return finalAxis
  }

  showHelpers() {
    // Camera helpers
    this.cameraHelper = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0x00ff00, visible: true })
    )
    this.scene.add(this.cameraHelper)

    for (let i = 0; i < 8; i++) {
      this.cameraYAngle += CONFIG.ROTATION_Y_ANGLE
      this.getPerpendicularXZAxisManually()
    }
    this.cameraYAngle = 0
  }
}

export default CameraController
