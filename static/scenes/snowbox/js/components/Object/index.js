import CONFIG from '../SceneManager/config.js'
import { EventEmitter } from '../../event-emitter.js'

class Object extends EventEmitter {
  constructor(scene, world) {
    super()

    this.scene = scene
    this.world = world

    this.selectable = false
    this.selected = false
    this.rotationY = 0
  }

  select() {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0xff00ff)
      }

      this.createGhost()
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = this.mass
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0x888888)
      }

      this.deleteGhost()
    }
  }

  update() {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)
    }
  }

  rotate(axis, angle) {
    this.rotationY = this.rotationY + angle
    if (this.body) {
      this.body.quaternion.setFromAxisAngle(axis, this.rotationY)
      this.body.quaternion.normalize()
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
  }

  updateMeshFromBody() {}

  delete() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.mesh = undefined
    this.world.remove(this.body)
  }

  highlight() {
    if (this.mesh) {
      this.mesh.material.color.set(0xc444c4)
    }
  }

  unhighlight() {
    if (this.mesh) {
      this.mesh.material.color.set(0x888888)
    }
  }

  createGhost() {
    const { geometry, position } = this.mesh
    const material = new THREE.MeshPhongMaterial({ color: 0x32cd32 })

    this.ghost = new THREE.Mesh(geometry, material)
    this.ghost.position.copy(position)
    this.scene.add(this.ghost)
  }

  deleteGhost() {
    if (this.ghost) {
      this.scene.remove(this.ghost)
      this.ghost.geometry.dispose()
      this.ghost.material.dispose()
      this.ghost = undefined
    }
  }

  moveToGhost() {
    const { x, y, z } = this.ghost.position
    this.body.position.set(x, y, z)
  }
}

export default Object
