goog.provide('app.Fence')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools')
goog.require('Utils')

app.Fence = class Fence extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('fences').append(this.elem)
  }

  onInit(config) {
    console.log(config)
    const {x, y, offset, top, right, bottom, left } = config
    this.position = {
      x: x + offset.x,
      y: y + offset.y,
    }

    let classes = 'fence'

    if (top) {
      classes += ' fence--top'
    }

    if (right) {
      classes += ' fence--right'
    }

    if (bottom) {
      classes += ' fence--bottom'
    }

    if (left) {
      classes += ' fence--left'
    }

    this.elem.setAttribute('class', classes)
    super.onInit(config)

    this.config.triggerAction = 'on-border'
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  onContact(player) {
    let actions = []

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInFence(this, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
    }

    return actions
  }
}

app.shared.pools.mixin(app.Fence)
