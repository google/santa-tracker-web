goog.provide('app.PresentBox')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.Controls')
goog.require('app.shared.pools');
goog.require('Utils')

app.PresentBox = class PresentBox extends app.Entity {
  constructor() {
    super()

    this.elem = document.createElement('div')
    document.getElementById('present-boxes').append(this.elem)
    this.elem.setAttribute('class', 'present-box')
  }

  onInit(config) {
    config.width = Constants.PRESENT_WIDTH
    config.height = Constants.PRESENT_HEIGHT

    super.onInit(config)
    this.config.checkBorder = true
    this.elem.classList.add(`present-box--${this.config.playerId}`)

    // todo: pick a random table variation

    if (this.config.side) {
      this.elem.classList.add('present-box--side')
    }

    if (this.config.middle) {
      this.elem.classList.add('present-box--middle')
    }
  }

  onDispose() {
    this.elem.setAttribute('class', 'present-box')
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []
    let toyCompleted = player.id == this.config.playerId

    if (toyCompleted) {
      // check if all parts are here
      for (let i = 1; i <= this.config.toy.length; i++) {
        if (player.toyParts.indexOf(i) == -1) {
          toyCompleted = false
        }
      }
    }

    // if player is close to border, it can do an action
    if (toyCompleted && Utils.isTouchingBorder(this.config, player.position)) {
      if (app.Controls.isTouch || app.Controls.isKeyControlActive(player.controls.action)) {
        actions = [Constants.PLAYER_ACTIONS.ACCEPT_TOY]
      }
      if (Constants.DEBUG) {
        this.elem.style.opacity = 0.5
      }
    } else if (Constants.DEBUG) {
      this.elem.style.opacity = 1
    }

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
    }

    return actions
  }
}

app.shared.pools.mixin(app.PresentBox)

