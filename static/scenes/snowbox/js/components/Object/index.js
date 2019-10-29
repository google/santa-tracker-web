import CONFIG from './config.js'
import GLOBAL_CONFIG from '../SceneManager/config.js'
import { EventEmitter } from '../../event-emitter.js'
import LoaderManager from '../../managers/LoaderManager/index.js'


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

    this.init = this.init.bind(this)
    this.load = this.load.bind(this)
  }

  load(callback) {
    this.callback = callback
    const { name, normalMap, obj } = this
    LoaderManager.load({name, normalMap, obj}, this.init)
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

    // CANNON JS
    const shape = this.createShape()
    this.body = new CANNON.Body({
      mass: this.mass,
      shape,
      fixedRotation: false,
      material: this.material === 'ice' ? GLOBAL_CONFIG.SLIPPERY_MATERIAL : GLOBAL_CONFIG.NORMAL_MATERIAL
    })
    this.body.position.set(-this.size / 2, -100, -this.size / 2) // y: -100 to prevent the body to interact with anything in the scene
    this.world.add(this.body)

    // Mesh
    this.mesh = new THREE.Mesh(this.geometry, this.materials.default)
    this.mesh.scale.multiplyScalar(1 / GLOBAL_CONFIG.MODEL_UNIT)
    this.mesh.updateMatrix()
    this.mesh.position.copy(this.body.position)
    this.mesh.geometry.computeBoundingBox()
    this.mesh.matrixWorldNeedsUpdate = true
    this.mesh.visible = false
    this.scene.add(this.mesh)

    // box
    this.box = this.mesh.geometry.boundingBox.clone()
    this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)

    this.defaultMeshScale = this.mesh.scale.clone()

    if (this.callback) {
      this.callback(this)
    }
  }

  select() {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh) {
        this.unhighlight()

        if (this.mesh.visible) {
          const edges = new THREE.EdgesGeometry(this.mesh.geometry, 45)
          this.wireframe = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: CONFIG.WIREFRAME_COLOR, linewidth: 3 })
          )
          this.scene.add(this.wireframe)
        }
        this.mesh.visible = false
      }

      this.createGhost()
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = this.mass
      this.body.updateMassProperties()

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

  update() {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)

      this.isMoving = this.body.velocity.norm2() + this.body.angularVelocity.norm2() > 1

      if (this.wireframe) {
        this.wireframe.position.copy(this.mesh.position)
        this.wireframe.quaternion.copy(this.mesh.quaternion)
        this.wireframe.scale.copy(this.mesh.scale)
      }

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
    }
  }

  rotate(axis, angle) {
    const euler = new THREE.Euler().setFromQuaternion(this.ghost.quaternion)
    this.rotationX = euler.x
    this.rotationY = euler.y

    const rotation = axis.almostEquals(new CANNON.Vec3(0, 1, 0), 0) ? this.rotationY + angle : this.rotationX + angle

    if (this.ghost) {
      this[axis.almostEquals(new CANNON.Vec3(0, 1, 0), 0) ? 'rotationY' : 'rotationX'] = rotation
      const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.rotationX, this.rotationY, 0, 'XYZ'))
      this.ghost.quaternion.copy(quaternion)
      this.ghost.quaternion.normalize()
    }
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
    this.updateRotatingCircle()
  }

  scaleBody() {
    this.body.shapes = []
    const shape = this.createShape(this.scaleFactor)
    this.body.addShape(shape)
    this.body.mass = this.mass * Math.pow(this.size * this.scaleFactor, 3)
  }

  delete() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.mesh = undefined
    this.world.remove(this.body)

    // remove ghost
    this.scene.remove(this.ghost)
    this.ghost.geometry.dispose()
    this.ghost.material.dispose()
    this.ghost = undefined

    //remove ghosthelper
    if (this.ghostHelper) {
      this.scene.remove(this.ghostHelper)
      this.ghostHelper = undefined
    }
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
    // X Circle
    const xRadius = Math.max(1, (this.box.max.x - this.box.min.x) / 1.25)
    var xGeometry = new THREE.TorusBufferGeometry(xRadius, 0.02, 32, 32)
    this.xCircle = new THREE.Mesh(xGeometry, CONFIG.ROTATE_CIRCLE_MATERIAL)
    const xQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    this.xCircle.applyQuaternion(xQuaternion)
    this.xCircle.geometry.computeBoundingSphere()

    // X Circle
    const yRadius = Math.max(1, (this.box.max.y - this.box.min.y) / 1.25)
    var yGeometry = new THREE.TorusBufferGeometry(yRadius, 0.02, 32, 32)
    this.yCircle = new THREE.Mesh(yGeometry, CONFIG.ROTATE_CIRCLE_MATERIAL)
    const yQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    this.yCircle.applyQuaternion(yQuaternion)
    this.yCircle.geometry.computeBoundingSphere()

    this.updateRotatingCircle(zoom)

    this.scene.add(this.xCircle)
    this.scene.add(this.yCircle)
  }

  updateRotatingCircle(zoom) {
    if (zoom) {
      this.xCircle.scale.set(1 / zoom, 1 / zoom, 1 / zoom)
      this.yCircle.scale.set(1 / zoom, 1 / zoom, 1 / zoom)
    } else {
      const xRadius = Math.max(1, (this.box.max.x - this.box.min.x) / 1.25)
      var xGeometry = new THREE.TorusBufferGeometry(xRadius, 0.02, 32, 32)
      this.xCircle.geometry.dispose()
      this.xCircle.geometry = xGeometry
      this.xCircle.geometry.computeBoundingSphere()

      const yRadius = Math.max(1, (this.box.max.y - this.box.min.y) / 1.25)
      var yGeometry = new THREE.TorusBufferGeometry(yRadius, 0.02, 32, 32)
      this.yCircle.geometry.dispose()
      this.yCircle.geometry = yGeometry
      this.yCircle.geometry.computeBoundingSphere()
    }
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
    if (this.xCircle) {
      this.scene.remove(this.xCircle)
      this.xCircle.geometry.dispose()
      this.xCircle = undefined
    }

    if (this.yCircle) {
      this.scene.remove(this.yCircle)
      this.yCircle.geometry.dispose()
      this.yCircle = undefined
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

  setEditTools(zoom) {
    this.createRotateCircle(zoom)
  }

  unsetEditTools() {
    this.deleteRotateCircle()
  }
}

export default Object
