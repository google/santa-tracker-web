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

    this.endPos = {
      x: this.config.isVertical ? this.config.startPos.x : this.config.startPos.x + this.config.movementLength,
      y: this.config.isVertical ? this.config.startPos.y + this.config.movementLength : this.config.startPos.y
    }

    this.reversing = false

    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  reset() {

  }

  onFrame() {
    const prevPosition = Object.assign({}, this.position)

    if (!this.reversing) {
      if (this.config.isVertical) {
        this.position.y = this.position.y + this.config.stepSize
        if (this.position.y >= this.endPos.y) {
          this.reversing = true
          this.position.y = this.endPos.y
        }
      } else {
        this.position.x = this.position.x + this.config.stepSize
        if (this.position.x >= this.endPos.x) {
          this.reversing = true
          this.position.x = this.endPos.x
        }
      }
    } else {
      if (this.config.isVertical) {
        this.position.y = this.position.y - this.config.stepSize
        if (this.position.y <= this.config.startPos.y) {
          this.reversing = false
          this.position.y = this.config.startPos.y
        }
      } else {
        this.position.x = this.position.x - this.config.stepSize
        if (this.position.x <= this.config.startPos.x) {
          this.reversing = false
          this.position.x = this.config.startPos.x
        }
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