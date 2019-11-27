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
    const { top, right, bottom, left, type } = config

    if (top) {
      this.addChild('top', type)
    }

    if (right) {
      this.addChild('right')
    }

    if (bottom) {
      this.addChild('bottom', type)
    }

    if (left) {
      this.addChild('left')
    }

    this.elem.setAttribute('class', 'fence')
    super.onInit(config)

    this.config.checkCell = true
    this.config.checkBorder = true
  }

  addChild(side, type = false) {
    const div = document.createElement('div')
    div.classList.add('fence__background')
    div.classList.add(`fence__background--${side}`)
    if (type) {
      div.classList.add(`fence__background--${type}`)
    }
    this.elem.appendChild(div)
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInFence(this.config, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [Constants.PLAYER_ACTIONS.BLOCK]
    }

    return actions
  }
}

app.shared.pools.mixin(app.Fence)
