goog.provide('app.PresentBox')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.Controls')
goog.require('app.LevelManager')
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

    // reset to base present box styles
    this.elem.setAttribute('class', 'present-box')

    this.elem.classList.add(`present-box--${this.config.playerId}`)

    let options = this.config.isMiddle ? 2 : 3
    const option = Math.floor(Math.random() * options) + 1
    if (this.config.isSideView && this.config.isMiddle) {
      this.elem.classList.add(`present-box--middle`)
      this.elem.classList.add(`present-box--middle-${option}`)
    } else if (this.config.isSideView && !this.config.isMiddle) {
      this.elem.classList.add(`present-box--bottom`)
      this.elem.classList.add(`present-box--bottom-${option}`)
    } else {
      this.elem.classList.add(`present-box--front`)
      this.elem.classList.add(`present-box--front-${option}`)
    }
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []
    let toyCompleted = player.id == this.config.playerId

    if (toyCompleted) {
      // check if all parts are here
      const { toyType } = app.LevelManager
      for (let i = 1; i <= toyType.size; i++) {
        if (player.toyParts.indexOf(i) == -1) {
          toyCompleted = false
        }
      }
    }

    // if player is close to border, it can do an action
    if (toyCompleted && Utils.isTouchingBorder(this.config, player.position)) {
      if (app.Controls.isTouch || app.Controls.isKeyControlActive(player.controls.action)) {
        if (!this.toyAccepted) {
          actions = [Constants.PLAYER_ACTIONS.ACCEPT_TOY]
          this.toyAccepted = true
          setTimeout(() => {
            this.toyAccepted = false
          }, 200) // have to add a timeout because actions are called multiple times in the RAF
        }
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

