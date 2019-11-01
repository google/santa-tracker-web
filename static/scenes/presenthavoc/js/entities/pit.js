goog.provide('app.Pit')

goog.require('Constants')

app.Pit = class Pit {
  constructor(position) {
    this.position = position
    this.elem = document.createElement('div')

    document.getElementById('pits').append(this.elem)

    this.elem.setAttribute('class', 'pit')
    this.elem.style.top = `${this.position.top}px`
    this.elem.style.left = `${this.position.left}px`
    this.elem.style.height = `${this.position.height}px`
    this.elem.style.width = `${this.position.width}px`
  }

  intersects(player) {
    // TODO: handle this with grid system
    // console.log(player.position, this.position)
    if (player.position.x > this.position.left &&
        player.position.x < this.position.left + this.position.width &&
        player.position.y > this.position.top &&
        player.position.y < this.position.top + this.position.height) {
      return true
    } else {
      return false
    }
  }
}