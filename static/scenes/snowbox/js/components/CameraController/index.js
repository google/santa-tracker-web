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

// Config
import CONFIG from './config.js'

// Utils
import isTouchDevice from '../../utils/isTouchDevice.js'
import { toRadian } from '../../utils/math.js'
import { outElastic, outExpo } from '../../utils/ease.js'
import SoundManager from '../../managers/SoundManager.js'
import RAFManager from '../../managers/RAFManager.js'

class CameraController {
  constructor() {
    this.rotationY = 0
    this.rotationXZ = 0
    this.raycaster = new THREE.Raycaster()
    this.currentZoom = 0
    this.zoomMin = CONFIG.ZOOM.MIN
    this.zoomMax = CONFIG.ZOOM.MAX
    this.rotationXZMin = CONFIG.ROTATE.XZ_MIN
    this.rotationXZMax = CONFIG.ROTATE.XZ_MAX
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
    this.camera.zoom = CONFIG.ZOOM.FOV
    this.camera.updateProjectionMatrix()

    this.buildControls()
    this.buildBox()
    this.buildFakeGround()
  }

  buildControls() {
    // this.controls = new THREE.MapControls(this.camera, this.canvas)
    // this.controls.minDistance = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MIN : CONFIG.CONTROLS.MIN
    // this.controls.maxDistance = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MAX : CONFIG.CONTROLS.MAX
    // this.controls.minPolarAngle = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MIN_ANGLE : CONFIG.CONTROLS.MIN_ANGLE
    // this.controls.maxPolarAngle = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.MAX_ANGLE : CONFIG.CONTROLS.MAX_ANGLE
    // this.controls.enableKeys = CONFIG.CONTROLS.KEYS
    // this.controls.enablePan = CONFIG.CONTROLS.PAN
    // this.controls.enableRotate = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.ROTATE : CONFIG.CONTROLS.ROTATE
    // this.controls.enableDamping = CONFIG.CONTROLS.DAMPING
    // this.controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR
    // this.controls.enableZoom = this.isTouchDevice ? CONFIG.MOBILE_CONTROLS.ZOOM : CONFIG.CONTROLS.ZOOM

    // temporary disable controls because we need to set a limit of camera movement
    // to avoid the user to go outside the moutain/sky
    // To Do: enable the controls when camera is zoomed in and set a limit of movement based on the
    // camera position
    this.controls = { enabled: false }
  }

  buildBox() {
    // create box to limit camera position
    this.box = new THREE.Box3(new THREE.Vector3(-CONFIG.BOX, -CONFIG.BOX, -CONFIG.BOX), new THREE.Vector3(CONFIG.BOX, CONFIG.BOX, CONFIG.BOX))
  }

  buildFakeGround() {
    // invisible plane to help camera rotation
    const geometry = new THREE.PlaneGeometry(50, 50)
    const material = new THREE.MeshBasicMaterial({ visible: false, color: 0xff0000 })
    this.fakeGround = new THREE.Mesh(geometry, material)
    this.fakeGround.rotation.x = toRadian(-90)
  }

  rotate(direction, noAnimation = false, angle = 1) {
    if (this.isZooming || this.isRotating) return
    this.controls.enabled = false

    switch (direction) {
      default:
        break
      case 'left':
        this.axis = new THREE.Vector3(0, 1, 0)
        if (noAnimation) {
          this.targetAngle = angle
        } else {
          this.targetAngle = CONFIG.ROTATE.Y
        }
        this.rotationY += this.targetAngle
        break
      case 'right':
        this.axis = new THREE.Vector3(0, 1, 0)
        if (noAnimation) {
          this.targetAngle = -angle
        } else {
          this.targetAngle = -CONFIG.ROTATE.Y
        }
        this.rotationY += this.targetAngle
        break
      case 'top':
        this.axis = this.getPerpendicularXZAxisManually()
        if (noAnimation) {
          this.targetAngle = -angle
        } else {
          this.targetAngle = -CONFIG.ROTATE.XZ
        }
        if (this.rotationXZ === CONFIG.ROTATE.XZ_MAX) {
          // don't rotate if reach min
          return false
        }
        this.rotationXZ = Math.max(this.rotationXZ + this.targetAngle, CONFIG.ROTATE.XZ_MAX)
        break
      case 'bottom':
        this.axis = this.getPerpendicularXZAxisManually()
        if (noAnimation) {
          this.targetAngle = angle
        } else {
          this.targetAngle = CONFIG.ROTATE.XZ
        }
        if (this.rotationXZ === CONFIG.ROTATE.XZ_MIN) {
          // don't rotate if reach min
          return false
        }
        this.rotationXZ = Math.min(this.rotationXZ + this.targetAngle, CONFIG.ROTATE.XZ_MIN)
        break
    }

    // get look at point
    const intersects = this.getLookAtPointOnTerrain()
    this.lookAt = intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0)
    this.lookAt.y = 0 // cleaning up decimals, this value should always be 0
    this.cameraPositionOrigin = this.camera.position.clone()

    if (noAnimation) {
      this.rotateAboutPoint(this.camera, this.cameraPositionOrigin, this.lookAt, this.axis, toRadian(this.targetAngle))
    } else {
      this.isRotating = true
      this.isMoving = true
      this.rotateOrigin = 0
      this.rotateTarget = this.targetAngle
      this.rotateSpeed = CONFIG.ROTATE.SPEED
      this.rotateStart = RAFManager.now
    }
  }

  animateRotate(now) {
    const percent = (now - this.rotateStart) / this.rotateSpeed
    if (percent < 1) {
      const angle = this.rotateOrigin + (this.rotateTarget - this.rotateOrigin) * outExpo(percent)
      this.rotateAboutPoint(this.camera, this.cameraPositionOrigin, this.lookAt, this.axis, toRadian(angle))
    } else {
      this.isRotating = false
      this.isMoving = false
    }
  }

  zoom(direction, noAnimation = false, force = CONFIG.ZOOM.FORCE) {
    if (this.isZooming || this.isRotating) return

    this.cameraPositionOrigin = this.camera.position.clone()
    this.lookAtVector = new THREE.Vector3()
    this.camera.getWorldDirection(this.lookAtVector)

    switch (direction) {
      default:
        break
      case 'out':
        this.lookAtVector.negate()
        this.zoomTarget = force
        if (this.currentZoom === CONFIG.ZOOM.MIN) {
          SoundManager.play('snowbox_fail')
          // don't rotate if reach min
          return false
        }
        SoundManager.play('snowbox_zoom_out')
        this.currentZoom = Math.min(this.currentZoom + this.zoomTarget, CONFIG.ZOOM.MIN)
        break
      case 'in':
        this.zoomTarget = force
        if (this.currentZoom === CONFIG.ZOOM.MAX) {
          SoundManager.play('snowbox_fail')
          // don't rotate if reach min
          return false
        }
        SoundManager.play('snowbox_zoom_in')
        this.currentZoom = Math.max(this.currentZoom - this.zoomTarget, CONFIG.ZOOM.MAX)
        break
    }

    if (noAnimation) {
      this.translateFromVector(this.camera, this.cameraPositionOrigin, this.lookAtVector, this.zoomTarget)
    } else {
      this.zoomOrigin = 0
      this.zoomSpeed = CONFIG.ZOOM.SPEED
      this.zoomStart = RAFManager.now
      this.isZooming = true
      this.isMoving = true
    }
  }

  animateZoom(now) {
    const percent = (now - this.zoomStart) / this.zoomSpeed
    if (percent < 1) {
      const translation = this.zoomOrigin + (this.zoomTarget - this.zoomOrigin) * outElastic(percent)
      this.translateFromVector(this.camera, this.cameraPositionOrigin, this.lookAtVector, translation)
    } else {
      this.isZooming = false
      this.isMoving = false
    }
  }

  moveOnEdges(edge) {
    const speed = CONFIG.EDGES_SPEED
    let x
    let z
    const angle = toRadian(this.rotationY)

    // Get xz position based on current rotationY and edge
    switch (edge) {
      default:
        break
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

  translateFromVector(camera, origin, vector, translate) {
    const helper = new THREE.Object3D()
    helper.position.copy(origin)

    const vectorHelper = new THREE.Vector3()
    vectorHelper.copy(vector)
    vectorHelper.multiplyScalar(translate)

    helper.position.add(vectorHelper)

    camera.position.copy(helper.position)

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
    if (target[0] && this.controls.target) {
      this.controls.target.set(target[0].point.x, target[0].point.y, target[0].point.z) // final pos
    }
  }
}

export default new CameraController()
