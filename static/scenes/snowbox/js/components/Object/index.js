import CONFIG from '../SceneManager/config.js'
import { EventEmitter } from '../../event-emitter.js'

class Object extends EventEmitter {
  constructor() {
    super()
    this.selectable = false
    this.selected = false
    this.rotationY = 0
  }

  select() {
    if (this.selectable) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh && this.selectedMaterial) {
        this.mesh.material = this.selectedMaterial
      }
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = this.mass
      this.body.updateMassProperties()

      if (this.mesh && this.originMaterial) {
        this.mesh.material = this.originMaterial
      }
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
    let { x, y, z } = this.body.position

    if (xNew != null) {
      x = xNew
    }

    if (yNew != null) {
      y = yNew
    }

    if (zNew != null) {
      z = zNew
    }

    this.body.position.set(x, y, z)
  }

  updateMeshFromBody() {}

  delete() {
    console.log('delete')
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
}

export default Object
