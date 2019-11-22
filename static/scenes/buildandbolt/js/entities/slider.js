goog.provide('app.Slider')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Slider = class Slider extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
  }

  onInit(config) {
    this.config = { ...config, triggerAction: 'on-cell' }
    this.elem.classList.remove('hidden')

    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
    }

    this.endPos = {
      x: this.config.isVertical ? this.config.startPos.x : this.config.startPos.x + this.config.movementLength,
      y: this.config.isVertical ? this.config.startPos.y + this.config.movementLength : this.config.startPos.y
    }

    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`

    this.reversing = false

    this.game.board.addEntityToBoard(this, this.position.x, this.position.y, this.config.width, this.config.height)
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
        this.position.x, this.position.y,
        this.config.width, this.config.height)
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  onContact(player) {
    super.onContact(player)
  }
}