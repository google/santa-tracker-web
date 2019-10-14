// Config
import CONFIG from './config.js'

// Utils
import { toRadian } from '../../utils/math.js'
import { getNow } from '../../utils/time.js'
import { outQuad } from '../../utils/ease.js'

class CameraController {
  constructor(screenDimensions, canvas) {
    this.rotationY = 0
    this.rotationXZ = 0
    this.raycaster = new THREE.Raycaster()
    this.canvas = canvas

    const { width, height } = screenDimensions
    const aspectRatio = width / height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 1000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(0, CONFIG.POSITION_Y, CONFIG.POSITION_Z)
    this.camera.lookAt(0, 0, 0)

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
  }

  rotate(direction, terrain) {
    this.controls.enabled = false

    let axis
    let angle
    let lookAt

    switch (direction) {
      case 'left':
        axis = new THREE.Vector3(0, 1, 0)
        angle = CONFIG.ROTATION_Y
        this.rotationY += angle
        break
      case 'right':
        axis = new THREE.Vector3(0, 1, 0)
        angle = -CONFIG.ROTATION_Y
        this.rotationY += angle
        break
      case 'top':
        axis = this.getPerpendicularXZAxisManually()
        angle = -CONFIG.ROTATION_XZ
        if (this.rotationXZ + angle <= CONFIG.ROTATION_XZ_MAX) {
          // don't rotate if reach max
          return false
        }
        this.rotationXZ += angle
        break
      case 'bottom':
        axis = this.getPerpendicularXZAxisManually()
        angle = CONFIG.ROTATION_XZ
        if (this.rotationXZ + angle >= CONFIG.ROTATION_XZ_MIN) {
          // don't rotate if reach min
          return false
        }
        this.rotationXZ += angle
        break
    }

    const intersects = this.getLookAtPointOnTerrain(terrain)

    lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0)
    lookAt.y = 0 // cleaning up decimals, this value should always be 0
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
    finalAxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(this.rotationY))

    if (this.debug) this.arrowHelper(finalAxis)

    return finalAxis
  }

  showHelpers() {
    // helpers
    this.helper = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0x00ff00, visible: true })
    )
    this.scene.add(this.helper)

    for (let i = 0; i < 8; i++) {
      this.rotationY += CONFIG.ROTATION_Y
      this.getPerpendicularXZAxisManually()
    }
    this.rotationY = 0
  }
}

export default CameraController
