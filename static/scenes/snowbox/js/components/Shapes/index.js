import CONFIG from './config.js'
import GLOBAL_CONFIG from '../Scene/config.js'
import { EventEmitter } from '../../utils/event-emitter.js'
import LoaderManager from '../../managers/LoaderManager.js'
import { toRadian, clamp } from '../../utils/math.js'
import { throttle } from '../../utils/time.js'
import createCustomEvent from '../../utils/createCustomEvent.js'
import Scene from '../Scene/index.js'

class Object extends EventEmitter {
  constructor(scene, world) {
    super()

    this.scene = scene
    this.world = world

    this.selectable = false
    this.selected = false
    this.rotationY = 0
    this.rotationX = 0
    this.scaleFactor = 1
    this.scaleIndex = 0
    this.isMoving = false

    if (this.init) {
      this.init = this.init.bind(this)
    }
    this.load = this.load.bind(this)
    this.onCollide = this.onCollide.bind(this)
  }

  load(callback) {
    this.callback = callback
    const { name, normalMap, obj, wrl } = this
    LoaderManager.load({name, normalMap, obj, wrl}, this.init)
  }

  setShape(defaultMaterial) {
    // Secondary materials
    const highlightMaterial = defaultMaterial.clone()
    highlightMaterial.color.setHex(GLOBAL_CONFIG.COLORS.HIGHLIGHT)
    highlightMaterial.needsUpdate = true

    const ghostMaterial = defaultMaterial.clone()
    ghostMaterial.color.setHex(GLOBAL_CONFIG.COLORS.GHOST)
    ghostMaterial.needsUpdate = true
    this.materials = {
      default: defaultMaterial,
      highlight: highlightMaterial,
      ghost: ghostMaterial
    }

    // Mesh
    this.mesh = new THREE.Mesh(this.geometry, this.materials.default)
    // this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()
    this.mesh.position.set(-this.size / 2, 100, -this.size / 2) // y: 100 to prevent the body to interact with anything in the scene
    this.mesh.geometry.computeBoundingBox()
    this.mesh.matrixWorldNeedsUpdate = true
    this.mesh.visible = false
    this.defaultMeshScale = this.mesh.scale.clone()
    this.scene.add(this.mesh)

    // box
    this.box = this.mesh.geometry.boundingBox.clone()
    this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)

    // CANNON JS
    this.createBody()

    if (this.callback) {
      this.callback(this)
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
      material: this.material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })

    this.createShapes(this.scaleFactor)
    this.currentMass = this.mass
    this.body.position.copy(this.mesh.position)
    this.world.add(this.body)

    // listen collision of shape
    this.collide = throttle(this.onCollide, 0) // replace throttle value here if needed
    this.body.addEventListener('collide', this.collide)
  }

  createShapesFromWRL(models, scale) {
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const vertices = []
      const faces = []

      for (let i = 0; i < model.vertices.length; i += 3) {
        vertices.push( new CANNON.Vec3(model.vertices[i] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 1] / GLOBAL_CONFIG.MODEL_UNIT * scale, model.vertices[i + 2] / GLOBAL_CONFIG.MODEL_UNIT * scale))
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

  select() {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.sleep()

      if (this.mesh) {
        this.unhighlight()
        this.mesh.visible = false
      }

      this.createGhost()
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      if (this.body.sleepState > 0) {
        this.body.wakeUp()
      }

      if (this.moveToGhost) {
        if (this.mesh && !this.mesh.visible) {
          this.mesh.visible
        }
      }

      if (!this.mesh.visible) {
        this.mesh.visible = true
      }

      this.deleteGhost()
    }
  }

  update(cameraPosition) {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)

      if (this.mesh.position.y < CONFIG.Y_POS_LIMIT) {
        Scene.emit('leave_edit')
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

      if (this.ghost) {
        this.ghost.updateMatrixWorld(true)
        this.box.copy(this.ghost.geometry.boundingBox).applyMatrix4(this.ghost.matrixWorld)
      } else {
        this.mesh.updateMatrixWorld(true)
        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)
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
    let axis
    switch (direction) {
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

    this.ghost.position.set(x, y, z)

    this.ghost.updateMatrixWorld(true)
    this.box.copy(this.ghost.geometry.boundingBox).applyMatrix4(this.ghost.matrixWorld)
  }

  scale(value) {
    const scaleFactor = parseInt(value) / 10
    this.ghost.scale.set(
      this.defaultMeshScale.x * scaleFactor,
      this.defaultMeshScale.y * scaleFactor,
      this.defaultMeshScale.z * scaleFactor
    )
    this.scaleFactor = scaleFactor
  }

  scaleBody() {
    this.createBody()
    let shapeVolume = 0
    for (let i = 0; i < this.body.shapes.length; i++) {
      shapeVolume += this.body.shapes[i].volume()
    }
    // console.log(shapeVolume)

    const mass = 10 * shapeVolume
    this.body.invMass = mass
    this.currentMass = mass // the body.mass value is not updated in the collide event for some reason, storing the value here for now
    this.body.updateMassProperties()
  }

  highlight() {
    if (this.mesh) {
      this.mesh.material = this.materials ? this.materials.highlight : CONFIG.HIGHLIGHT_MATERIAL
    }
  }

  unhighlight() {
    if (this.mesh) {
      this.mesh.material = this.materials ? this.materials.default : CONFIG.DEFAULT_MATERIAL
    }
  }

  createGhost() {
    const { geometry, position, quaternion, scale } = this.mesh

    this.ghost = new THREE.Mesh(geometry, this.materials ? this.materials.ghost : CONFIG.GHOST_MATERIAL)
    this.ghost.position.copy(position)
    this.ghost.quaternion.copy(quaternion)
    this.ghost.scale.copy(scale)
    this.scene.add(this.ghost)
    this.ghost.geometry.computeBoundingBox()
    this.ghost.updateMatrixWorld()

    if (CONFIG.DEBUG) {
      if (this.ghostHelper) {
        this.scene.remove(this.ghostHelper)
        this.ghostHelper = undefined
      }
      this.ghostHelper = new THREE.BoxHelper(this.ghost, 0x00ff00)
      this.scene.add(this.ghostHelper)
    }
  }

  createRotateCircle(zoom) {
    // Calculate radius
    let maxRadius = Math.max((this.box.max.x - this.box.min.x) * 1.25, (this.box.max.y - this.box.min.y) * 1.25)
    maxRadius = clamp(maxRadius, 1, 4.2)
    const geometry = new THREE.TorusBufferGeometry(maxRadius, 0.04, 32, 32)
    const helperGeometry = new THREE.Geometry()
    helperGeometry.vertices.push(new THREE.Vector3(0, 0, 0))

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
    trashHelper.position.y = maxRadius * 0.775
    trashHelper.name = 'trash-helper'

    // Toolbar helper
    const toolbarHelper = new THREE.Points(helperGeometry, CONFIG.HELPER_MATERIAL)
    toolbarHelper.position.y = -(maxRadius + 1)
    toolbarHelper.name = 'toolbar-helper'
    yCircle.add(toolbarHelper)

    this.circles = new THREE.Object3D()
    this.circles.add( xCircle )
    this.circles.add( yCircle )
    this.circles.add( trashHelper )

    this.updateRotatingCircle(zoom)

    this.scene.add(this.circles)
  }

  updateRotatingCircle(zoom) {
    this.circles.scale.set(1 / zoom, 1 / zoom, 1 / zoom)
  }

  delete() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.mesh = undefined
    this.world.remove(this.body)

    this.box = undefined

    this.deleteGhost()
    this.deleteRotateCircle()
  }

  deleteGhost() {
    if (this.ghost) {
      this.scene.remove(this.ghost)
      this.ghost.geometry.dispose()
      this.ghost.material.dispose()
      this.ghost = undefined
    }

    if (this.wireframe) {
      this.scene.remove(this.wireframe)
      this.wireframe.geometry.dispose()
      this.wireframe.material.dispose()
      this.wireframe.undefined
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
    const { position, quaternion, scale } = this.ghost

    this.body.velocity.setZero()
    this.body.angularVelocity.setZero()

    this.body.position.set(position.x, position.y, position.z)
    this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    this.mesh.scale.copy(scale)
    this.scaleBody()
  }
}

export default Object
