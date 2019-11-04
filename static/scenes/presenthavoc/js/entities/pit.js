goog.provide('app.Pit')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Pit = class Pit extends app.Entity {
  constructor(position) {
    super()
    this.position = position
    this.elem = document.createElement('div')

    document.getElementById('pits').append(this.elem)

    this.elem.setAttribute('class', 'pit')
    this.elem.style.top = `${Utils.gridToPixelValue(this.position.top)}px`
    this.elem.style.left = `${Utils.gridToPixelValue(this.position.left)}px`
    this.elem.style.height = `${Utils.gridToPixelValue(this.position.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.position.width)}px`
  }

  // intersects(player) {
  //   // TODO: handle this with grid system
  //   // console.log(player.position, this.position)
  //   if (player.position.x > this.position.left &&
  //       player.position.x < this.position.left + this.position.width &&
  //       player.position.y > this.position.top &&
  //       player.position.y < this.position.top + this.position.height) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }
}