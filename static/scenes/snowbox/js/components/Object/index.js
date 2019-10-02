class Object {
  constructor() {
    this.selectable = false
    this.selected = false
    this.rotationY = 0
  }

  select() {
    if (this.selectable) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0xff00ff)
      }
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = 1
      console.log(this.body)
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0x888888)
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
      x = xNew - (this.body.aabb.upperBound.x - this.body.aabb.lowerBound.x) / 2
    }

    if (yNew != null) {
      y = yNew
    }

    if (zNew != null) {
      z = zNew - (this.body.aabb.upperBound.z - this.body.aabb.lowerBound.z) / 2
    }

    this.body.position.set(x, y, z)
  }
}

export default Object
