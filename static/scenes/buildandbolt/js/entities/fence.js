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
    const classes = `fence${config.sides.left ? ' fence--left' : ''}${config.sides.right ? ' fence--right' : ''}${config.sides.top ? ' fence--top' : ''}${config.sides.bottom ? ' fence--bottom' : ''}`
    this.elem.setAttribute('class', classes)
    super.onInit(config)

    this.config.triggerAction = 'on-border'
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    if (this.config.sides.top) {
      if (player.prevPosition.y <= this.config.y &&
          player.position.y >= this.config.y) {
        return [Constants.PLAYER_ACTIONS.BLOCK]
      }
    }

    return []
  }
}

app.shared.pools.mixin(app.Fence)
