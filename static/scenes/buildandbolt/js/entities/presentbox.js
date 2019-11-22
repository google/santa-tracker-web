goog.provide('app.PresentBox')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools');
goog.require('Utils')

app.PresentBox = class PresentBox extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config
    this.gameControls = game.controls

    this.elem = document.createElement('div')
    document.getElementById('present-boxes').append(this.elem)
    this.elem.setAttribute('class', 'present-box')
  }

  onInit(config) {
    config.width = Constants.PRESENT_WIDTH
    config.height = Constants.PRESENT_HEIGHT

    super.onInit(config)
    this.config.triggerAction = 'on-border'
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {

    // // if player is close to border, it can take a toy
    // if (Utils.isTouchingBorder(this.config, player.position)) {
    //   if (this.gameControls.isKeyControlActive(player.controls.action)) {
    //     actions = [Constants.PLAYER_ACTIONS.ADD_TOY_PART]
    //   }
    //   if (Constants.DEBUG) {
    //     this.elem.style.opacity = 0.5
    //   }
    // } else if (Constants.DEBUG) {
    //   this.elem.style.opacity = 1
    // }

    // // if player is in the border, he is blocked
    // if (Utils.isInBorder(this.config, player.position)) {
    //   actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
    // }

    if (!this.gameControls.isKeyControlActive(player.controls.action)) {
      return [Constants.PLAYER_ACTIONS.BLOCK]
    }

    for (const part of this.config.parts) {
      if (player.toyParts.indexOf(part) == -1) {
        return [Constants.PLAYER_ACTIONS.BLOCK]
      }
    }

    return [Constants.PLAYER_ACTIONS.ACCEPT_TOY, Constants.PLAYER_ACTIONS.BLOCK]
  }
}

app.shared.pools.mixin(app.PresentBox)

