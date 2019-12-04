goog.provide('app.Table')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools');
goog.require('Utils')

app.Table = class Table extends app.Entity {
  constructor(game, config) {
    super()
    this.config = config
    this.gameControls = game.controls
    this.lastSoundTime = 0;
    this.elem = document.createElement('div')
    document.getElementById('tables').append(this.elem)
    this.elem.setAttribute('class', 'table')
  }

  onInit(config) {
    if (config.isSideView) {
      config.width = Constants.TABLE_HEIGHT
      config.height = Constants.TABLE_WIDTH
    } else {
      config.width = Constants.TABLE_WIDTH
      config.height = Constants.TABLE_HEIGHT
    }

    super.onInit(config)
    this.config.checkBorder = true

    let classes = `table table--${this.config.partType} table--${this.config.tableType}${config.isSideView ? ' table--side' : ''}`
    this.elem.setAttribute('class', classes)
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []

    // if player is close to border, it can do an action
    if (Utils.isTouchingBorder(this.config, player.position)) {
      if (this.gameControls.isTouch || this.gameControls.isKeyControlActive(player.controls.action)) {
        actions = [Constants.PLAYER_ACTIONS.ADD_TOY_PART]
      }
      if (Constants.DEBUG) {
        this.elem.style.opacity = 0.5
      }
    } else if (Constants.DEBUG) {
      this.elem.style.opacity = 1
    }

    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
      this.playSound();
    }

    return actions
  }

  playSound() {
    if (performance.now() - this.lastSoundTime > 700) {
      window.santaApp.fire('sound-trigger', 'buildandbolt_thud');
      this.lastSoundTime = performance.now();
    }
  }

}

app.shared.pools.mixin(app.Table)
