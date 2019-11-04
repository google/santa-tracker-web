goog.provide('app.Penguin')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Penguin = class Penguin extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('penguins').append(this.elem)
    this.elem.setAttribute('class', 'penguin')

    this.init()
  }

  init() {
    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
    }

    const xLength = this.config.endPos.x - this.config.startPos.x
    const yLength = this.config.endPos.y - this.config.startPos.y
    const travelLength = Math.hypot(xLength, yLength)

    const stepSize = this.config.stepSize
    const travelXAngle = Math.asin(xLength / travelLength)
    const travelYAngle = Math.asin(yLength / travelLength)
    const stepX = Math.sin(travelXAngle) * stepSize
    const stepY = Math.sin(travelYAngle) * stepSize

    this.step = {
      x: stepX,
      y: stepY
    }

    this.reversing = false

    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  reset() {

  }

  onFrame() {
    const prevPosition = Object.assign({}, this.position)

    if (!this.reversing) {
      const newX = this.position.x + this.step.x
      const newY = this.position.y + this.step.y

      if ((this.step.x > 0 && newX >= this.config.endPos.x) ||
          (this.step.x <= 0 && newX <= this.config.endPos.x)) {
        // time to turn around
        this.reversing = true
        this.position.x = this.config.endPos.x
        this.position.y = this.config.endPos.y
      } else {
        this.position.x = newX
        this.position.y = newY
      }
    } else {
      const newX = this.position.x - this.step.x
      const newY = this.position.y - this.step.y

      if ((this.step.x > 0 && newX <= this.config.startPos.x) ||
          (this.step.x <= 0 && newX >= this.config.startPos.x)) {
        // time to turn around
        this.reversing = false
        this.position.x = this.config.startPos.x
        this.position.y = this.config.startPos.y
      } else {
        this.position.x = newX
        this.position.y = newY
      }
    }

    this.render()
    this.game.board.updateEntityPosition(this,
        prevPosition.x, prevPosition.y,
        this.position.x, this.position.y)
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  onContact(player) {
    super.onContact(player)
    return Constants.PLAYER_ACTIONS.RESTART
  }
}