import GLOBAL_CONFIG from '../SceneManager/config.js'
import CONFIG from './config.js'
import { EventEmitter } from '../../event-emitter.js'

class Object extends EventEmitter {
  constructor(scene, world) {
    super()

    this.scene = scene
    this.world = world

    this.selectable = false
    this.selected = false
    this.rotationY = 0
    this.scaleFactor = 1
  }

  addToScene() {
    this.world.add(this.body)

    this.mesh.position.copy(this.body.position)
    this.scene.add(this.mesh)

    this.mesh.geometry.computeBoundingBox()
    this.mesh.matrixWorldNeedsUpdate = true
    this.box = this.mesh.geometry.boundingBox.clone()
    this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)
    this.mesh.visible = false
  }

  select() {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material = CONFIG.SELECTED_MATERIAL
      }

      this.createGhost()
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = this.mass
      this.body.updateMassProperties()

      if (this.mesh && this.defaultMaterial) {
        this.mesh.material = this.defaultMaterial
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
      if (this.ghost) {
        this.ghost.updateMatrixWorld(true)
        this.box.copy(this.ghost.geometry.boundingBox).applyMatrix4(this.ghost.matrixWorld)
      } else {
        this.mesh.updateMatrixWorld(true)
        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)
      }
      if (GLOBAL_CONFIG.DEBUG) {
        this.ghostHelper.update()
      }
    }
  }

  rotate(axis, angle) {
    this.rotationY = this.rotationY + angle
    if (this.ghost) {
      this.ghost.quaternion.setFromAxisAngle(axis, this.rotationY)
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

  scale(direction) {
    const currentScale = this.ghost.scale
    const scaleFactor = direction === 'up' ? CONFIG.SCALE_FACTOR : 1 / CONFIG.SCALE_FACTOR

    if (this.scaleFactor * scaleFactor < 1.9 && this.scaleFactor * scaleFactor > 0.5) {
      this.ghost.scale.set(currentScale.x * scaleFactor, currentScale.y * scaleFactor, currentScale.z * scaleFactor)
      this.scaleFactor *= scaleFactor
    }
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
  }

  highlight() {
    if (this.mesh) {
      this.mesh.material = CONFIG.HIGHLIGHT_MATERIAL
    }
  }

  unhighlight() {
    if (this.mesh && this.defaultMaterial) {
      this.mesh.material = this.defaultMaterial
    }
  }

  createGhost() {
    const { geometry, position, quaternion, scale } = this.mesh

    this.ghost = new THREE.Mesh(geometry, CONFIG.GHOST_MATERIAL)
    this.ghost.position.copy(position)
    this.ghost.quaternion.copy(quaternion)
    this.ghost.scale.copy(scale)
    this.scene.add(this.ghost)
    this.ghost.geometry.computeBoundingBox()

    if (GLOBAL_CONFIG.DEBUG) {
      this.scene.remove(this.ghostHelper)
      this.ghostHelper = undefined
      this.ghostHelper = new THREE.BoxHelper(this.ghost, 0x00ff00)
      this.scene.add(this.ghostHelper)
    }
  }

  deleteGhost() {
    if (this.ghost) {
      this.scene.remove(this.ghost)
      this.ghost.geometry.dispose()
      this.ghost.material.dispose()
      this.ghost = undefined
    }

    if (GLOBAL_CONFIG.DEBUG) {
      this.scene.remove(this.ghostHelper)
      this.ghostHelper = undefined
      this.ghostHelper = new THREE.BoxHelper(this.mesh, 0x00ff00)
      this.scene.add(this.ghostHelper)
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
