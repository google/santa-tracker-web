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

import CONFIG from './config.js'
import GLOBAL_CONFIG from '../Scene/config.js'
import LoaderManager from '../../managers/LoaderManager.js'
import { toRadian, clamp } from '../../utils/math.js'
import { throttle } from '../../utils/time.js'
import createCustomEvent from '../../utils/createCustomEvent.js'
import { SHAPE_COLORS } from  '../../constants/index.js'
import { darken } from '../../utils/colors.js'

class Shape {
  constructor(scene, world) {
    this.scene = scene
    this.world = world

    this.selectable = false
    this.editable = true
    this.selected = false
    this.rotationY = 0
    this.rotationX = 0
    this.scaleFactor = 1.5
    this.scaleIndex = 0
    this.isMoving = false
    this.geoMats = []
    this.centerOffsetY = 0
    this.highlightColor = new THREE.Color(darken(GLOBAL_CONFIG.COLORS.ICE_HEXA, 15))
    this.stableThreshold = 0.01
    this.stableThrottleTime = 500

    this.lastBodyPosition = {
      x: 0,
      y: 0,
      z: 0,
    }

    if (this.init) {
      this.init = this.init.bind(this)
    }
    this.load = this.load.bind(this)
    this.onCollide = this.onCollide.bind(this)
    this.isStable = this.isStable.bind(this)
  }

  load(callback) {
    this.callback = callback
    const { name, normalMap, obj, wrl } = this
    LoaderManager.load({ name, normalMap, obj, wrl }, this.init)
  }

  setShape(defaultMaterial) {
    // Secondary materials
    const highlightMaterial = defaultMaterial.clone()
    highlightMaterial.color = this.highlightColor
    highlightMaterial.needsUpdate = true

    const ghostMaterial = defaultMaterial.clone()
    ghostMaterial.color.setHex(GLOBAL_CONFIG.COLORS.GHOST)
    ghostMaterial.needsUpdate = true
    this.materials = {
      default: defaultMaterial,
      highlight: highlightMaterial,
      ghost: ghostMaterial,
    }

    // Mesh
    // Create mesh from obj
    this.mesh = new THREE.Object3D()
    for (let i = 0; i < this.geoMats.length; i++) {
      const mesh = new THREE.Mesh(this.geoMats[i].geometry, this.geoMats[i].material)
      this.geoMats[i].geometry.computeBoundingBox()
      this.mesh.add(mesh)
    }
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.defaultMeshScale = this.mesh.scale.clone()
    this.mesh.scale.set(
      this.defaultMeshScale.x * this.scaleFactor,
      this.defaultMeshScale.y * this.scaleFactor,
      this.defaultMeshScale.z * this.scaleFactor,
    )
    this.mesh.updateMatrix()
    this.mesh.position.set(0, 100, 0) // y: 100 to prevent the body to interact with anything in the scene
    if (this.rotationY) {
      this.mesh.rotation.y = this.rotationY
    }
    this.mesh.matrixWorldNeedsUpdate = true
    this.mesh.visible = false


    this.updateDefaultColors()

    this.scene.add(this.mesh)

    // CANNON JS
    this.createBody()

    if (this.callback) {
      this.callback(this)
    }

    if (this.name !== 'tree') {
      this.stable = throttle(this.isStable, this.stableThrottleTime)
      // listen raf
      window.addEventListener('RAF', this.stable)
    }
  }

  createBody() {
    if (this.body) { // reset body
      this.body.removeEventListener('collide', this.collide)
      this.body.shapes = []
      this.world.remove(this.body)
    }

    this.body = new CANNON.Body({
      mass: this.mass,
      fixedRotation: false,
      // material: GLOBAL_CONFIG.NORMAL_MATERIAL,
      linearDamping: 0,
      angularDamping: 0,
    })

    this.createShapes(this.scaleFactor)
    this.currentMass = this.mass
    this.body.position.copy(this.mesh.position)
    this.body.quaternion.copy(this.mesh.quaternion)
    this.world.add(this.body)

    // listen collision of shape
    this.collide = throttle(this.onCollide, 50) // replace throttle value here if needed
    this.body.addEventListener('collide', this.collide)
  }

  isStable() {
    // This is a fix for bodies always sliding whatever the material used
    // https://github.com/schteppe/cannon.js/issues/348
    // Check if the body didn't move a lot since 500ms, if not make it sleep to make it 100% stable
    if (this.body) {
      const diffPosition = Math.abs(this.body.position.x - this.lastBodyPosition.x)
        + Math.abs(this.body.position.y - this.lastBodyPosition.y)
        + Math.abs(this.body.position.z - this.lastBodyPosition.z)

      if (diffPosition < this.stableThreshold && this.body.sleepState !== 2) {
        this.body.sleep()
      }

      this.lastBodyPosition.x = this.body.position.x
      this.lastBodyPosition.y = this.body.position.y
      this.lastBodyPosition.z = this.body.position.z
    }
  }

  createShapesFromWRL(models, scale) {
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const vertices = []
      const faces = []

      for (let i = 0; i < model.vertices.length; i += 3) {
        vertices.push(new CANNON.Vec3(model.vertices[i] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 1] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 2] / GLOBAL_CONFIG.MODEL_UNIT * scale))
      }

      for (let i = 0; i < model.faces.length; i += 3) {
        faces.push([model.faces[i], model.faces[i + 1], model.faces[i + 2]])
      }

      const shape = new CANNON.ConvexPolyhedron(vertices, faces)
      this.body.addShape(shape)
    }
  }

  onCollide(e) {
    const relativeVelocity = e.contact.getImpactVelocityAlongNormal()
    if (Math.abs(relativeVelocity) > 0.25) {
      window.dispatchEvent(createCustomEvent('shape_collide', {
        force: relativeVelocity,
        type: this.name,
        mass: this.currentMass,
        scale: this.scaleFactor,
      }))
    }
  }

  select(isAddingShape) {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.sleep()

      this.mesh.visible = true

      if (isAddingShape) {
        this.showGhost()
      }
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false

      if (this.body.sleepState > 0) {
        this.body.wakeUp()
      }

      this.hideGhost()
    }
  }

  update(cameraPosition) {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)

      if (this.mesh.position.y < CONFIG.Y_POS_LIMIT) {
        window.dispatchEvent(createCustomEvent('LEAVE_EDIT'))
        this.delete()
        return
      }

      this.isMoving = this.body.velocity.norm2() + this.body.angularVelocity.norm2() > 1 // do we still need this?

      // Update torus
      if (this.xCircle) {
        this.xCircle.position.copy(this.ghost ? this.ghost.position : this.mesh.position)
      }
      if (this.yCircle) {
        this.yCircle.position.copy(this.ghost ? this.ghost.position : this.mesh.position)
      }

      if (CONFIG.DEBUG) {
        this.ghostHelper.update()
      }

      if (this.circles) {
        this.circles.position.copy(this.mesh.position)
        this.circles.lookAt(cameraPosition)
      }
    }
  }

  rotate(direction, angle, currentCameraYRotation) {
    if (!this.ghost) {
      this.showGhost()
    }

    let axis
    switch (direction) {
      default:
        break
      case 'right':
        axis = new THREE.Vector3(0, 1, 0)
        break
      case 'bottom':
        // getPerpendicularXZAxisManually
        axis = new THREE.Vector3(1, 0, 0)
        axis.applyAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(currentCameraYRotation - 45)) // -45 is the offset of the rotate edit tool compare to the camera
        break
    }

    this.ghost.rotateOnWorldAxis(axis, angle)
  }

  moveTo(xNew, yNew, zNew) {
    let { x, y, z } = this.ghost.position

    if (xNew != null) {
      x = xNew
    }

    if (yNew != null) {
      y = yNew
    }

    if (zNew != null) {
      z = zNew
    }

    this.ghost.position.set(x, y + this.centerOffsetY * this.scaleFactor, z) // offset center of rotation for trees
  }

  scale(value) {
    if (!this.ghost) {
      this.showGhost()
    }

    const scaleFactor = parseInt(value) / 10
    this.ghost.scale.set(
      this.defaultMeshScale.x * scaleFactor,
      this.defaultMeshScale.y * scaleFactor,
      this.defaultMeshScale.z * scaleFactor
    )

    this.scaleFactor = scaleFactor
    this.mesh.scale.copy(this.ghost.scale)
  }

  updateBody() {
    this.createBody()
    let shapeVolume = 0
    for (let i = 0; i < this.body.shapes.length; i++) {
      shapeVolume += this.body.shapes[i].volume()
    }

    const mass = this.mass * shapeVolume
    this.body.invMass = mass
    this.currentMass = mass // the body.mass value is not updated in the collide event for some reason, storing the value here for now
    this.body.updateMassProperties()
  }

  highlight() {
    if (this.mesh) {
      for (let i = 0; i < this.mesh.children.length; i++) {
        const child = this.mesh.children[i]
        if (this.mulipleMaterials) {
          if (this.name === 'gift' && i === 4) {
            child.material = this.materials.highlight
          } else if (this.name === 'tree' && i === 0) {
            child.material = this.materials.highlight
          }
        } else {
          child.material = this.materials.highlight
        }
      }
    }
  }

  unhighlight() {
    if (this.mesh) {
      for (let i = 0; i < this.mesh.children.length; i++) {
        const child = this.mesh.children[i]
        if (this.mulipleMaterials) {
          if (this.name === 'gift' && i === 4) {
            child.material = this.materials.default
          } else if (this.name === 'tree' && i === 0) {
            child.material = this.materials.default
          }
        } else {
          child.material = this.materials.default
        }
      }
    }
  }

  showGhost() {
    this.createGhost()

    if (this.ghost) {
      this.ghost.visible = true
    }
    if (this.mesh) {
      this.mesh.visible = false
    }
  }

  hideGhost() {
    if (this.moveToGhost) {
      if (this.mesh && !this.mesh.visible) {
        this.mesh.visible = true
      }
    }

    if (!this.mesh.visible) {
      this.mesh.visible = true
    }

    this.deleteGhost()
  }

  createGhost() {
    const { position, quaternion, scale } = this.mesh

    this.ghost = new THREE.Object3D()

    for (let i = 0; i < this.geoMats.length; i++) {
      const mesh = new THREE.Mesh(this.geoMats[i].geometry, this.materials.ghost)
      this.ghost.add(mesh)
    }

    this.ghost.position.copy(position)
    this.ghost.quaternion.copy(quaternion)
    this.ghost.scale.copy(scale)
    this.scene.add(this.ghost)
    this.ghost.updateMatrixWorld()
  }

  createRotateCircle(zoom) {
    // Calculate radius
    const box = new THREE.Box3().setFromObject(this.mesh)
    let maxRadius = Math.max((box.max.x - box.min.x) * 0.8, (box.max.y - box.min.y) * 0.8)
    maxRadius = clamp(maxRadius, 2.5, 4)
    const geometry = new THREE.TorusBufferGeometry(maxRadius, 0.04, 32, 32)
    const helperGeometry = new THREE.Geometry()
    helperGeometry.vertices.push(new THREE.Vector3(0, 0, 0))

    this.circles = new THREE.Object3D()

    // X Circle
    const xCircle = new THREE.Mesh(geometry, CONFIG.ROTATE_CIRCLE_MATERIAL)
    xCircle.rotation.x = toRadian(125) // rotations to make it looks like the mockup, for any updates use snowbox-gui-circles to help you
    xCircle.rotation.z = toRadian(50)
    // Arrow rotation X helper
    const xArrowHelper = new THREE.Points(helperGeometry, CONFIG.HELPER_MATERIAL)
    xArrowHelper.position.x = maxRadius
    xArrowHelper.name = 'arrow-helper-x'
    xCircle.add(xArrowHelper)

    // Y Circle
    const yCircle = new THREE.Mesh(geometry, CONFIG.ROTATE_CIRCLE_MATERIAL)
    yCircle.rotation.x = toRadian(30)
    yCircle.rotation.y = toRadian(55)
    yCircle.rotation.z = toRadian(10)
    // Arrow rotation Y helper
    const yArrowHelper = new THREE.Points(helperGeometry, CONFIG.HELPER_MATERIAL)
    yArrowHelper.position.y = maxRadius
    yArrowHelper.name = 'arrow-helper-y'
    yCircle.add(yArrowHelper)

    // Trash helper
    const trashHelper = new THREE.Points(helperGeometry, CONFIG.HELPER_MATERIAL)
    trashHelper.position.x = maxRadius * 1
    trashHelper.position.y = maxRadius * 0.775 - this.centerOffsetY * this.scaleFactor
    trashHelper.name = 'trash-helper'

    // Toolbar helper
    const toolbarHelper = new THREE.Points(helperGeometry, CONFIG.HELPER_MATERIAL)
    toolbarHelper.position.y = -(maxRadius * 1.85) - this.centerOffsetY * this.scaleFactor
    toolbarHelper.name = 'toolbar-helper'
    yCircle.add(toolbarHelper)

    this.circles.add(trashHelper)

    if (this.editable) {
      this.circles.add(xCircle)
      this.circles.add(yCircle)
      this.updateRotatingCircle(zoom)
    } else {
      this.circles.add(toolbarHelper)
    }

    this.scene.add(this.circles)
  }

  updateRotatingCircle(zoom) {
    this.circles.scale.set(1 / zoom, 1 / zoom, 1 / zoom)
  }

  updateDefaultColors() {
    // update colors
    if (!SHAPE_COLORS[this.name]) { // if shape not stored yet, store it
      SHAPE_COLORS[this.name] = {}
    }

    if (SHAPE_COLORS[this.name].default) { // if color already set, re-use the last one
      for (let i = 0; i < this.mesh.children.length; i++) {
        const child = this.mesh.children[i]
        if (this.name === 'gift') {
          // only change the last material color for gifts
          if (i === 4) {
            child.material.color = SHAPE_COLORS[this.name].default
          }
        } else {
          child.material.color = SHAPE_COLORS[this.name].default
        }
      }

      this.materials.highlight.color = SHAPE_COLORS[this.name].highlight
    }
  }

  delete() {
    this.scene.remove(this.mesh)
    // this.mesh.geometry.dispose()
    // this.mesh.material.dispose()
    this.mesh = undefined
    this.world.remove(this.body)

    this.box = undefined

    this.deleteGhost()
    this.deleteRotateCircle()
  }

  deleteGhost() {
    if (this.ghost) {
      this.scene.remove(this.ghost)
      // this.ghost.geometry.dispose()
      // this.ghost.material.dispose()
      this.ghost = undefined
    }

    if (CONFIG.DEBUG) {
      this.scene.remove(this.ghostHelper)
      this.ghostHelper = undefined
      this.ghostHelper = new THREE.BoxHelper(this.mesh, 0x00ff00)
      this.scene.add(this.ghostHelper)
    }
  }

  deleteRotateCircle() {
    if (this.circles) {
      this.scene.remove(this.circles)
    }
  }

  moveToGhost() {
    const { position, quaternion } = this.ghost
    this.updateBody()

    this.body.velocity.setZero()
    this.body.angularVelocity.setZero()

    this.body.position.set(position.x, position.y, position.z)
    this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)

    this.mesh.position.copy(position)
    this.mesh.quaternion.copy(quaternion)
    this.mesh.updateMatrixWorld(true)
  }
}

export default Shape
