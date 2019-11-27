goog.provide('app.Wall')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools')
goog.require('Utils')

app.Wall = class Wall extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('walls').append(this.elem)
    this.elem.setAttribute('class', 'wall')
  }

  onInit(config) {
    super.onInit(config)
    this.config.checkBorder = true
  }

  render() {
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
    }

    return actions
  }
}

app.shared.pools.mixin(app.Wall);
