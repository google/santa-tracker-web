goog.provide('app.Player')

goog.require('Constants')
goog.require('Utils')

app.Player = class Player {
  constructor(game, context, controls) {
    this.game = game
    this.gameControls = game.controls
    this.context = context
    this.controls = controls
  }

  init(config) {
    this.config = config

    this.toyParts = []

    this.platform = null

    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
      angle: 0
    }

    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  /**
   * Restarts the player to the beginning of the level, progress lost
   */
  restart() {
    this.context.classList.add('is-hidden')
    window.setTimeout(() => {
      this.prevPosition = Object.assign({}, this.position)
      this.position = {
        x: this.config.startPos.x,
        y: this.config.startPos.y,
        angle: 0
      }

      this.clearToyParts()

      this.game.board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y)

      this.context.classList.remove('is-hidden')
    }, 1000)
  }

  onFrame(delta) {
    this.prevPosition = Object.assign({}, this.position)

    if (this.gameControls.trackedKeys[this.controls.left]) {
      if (this.platform) {
        this.platformOffset.x -= Constants.PLAYER_STEP_SIZE
      } else {
        this.position.x = Math.max(0, this.position.x - Constants.PLAYER_STEP_SIZE)
      }
    }

    if (this.gameControls.trackedKeys[this.controls.right]) {
      if (this.platform) {
        this.platformOffset.x += Constants.PLAYER_STEP_SIZE
      } else {
        this.position.x = Math.min(Constants.GRID_DIMENSIONS.WIDTH - 1, this.position.x + Constants.PLAYER_STEP_SIZE)
      }
    }

    if (this.gameControls.trackedKeys[this.controls.up]) {
      if (this.platform) {
        this.platformOffset.y -= Constants.PLAYER_STEP_SIZE
      } else {
        this.position.y = Math.max(0, this.position.y - Constants.PLAYER_STEP_SIZE)
      }
    }

    if (this.gameControls.trackedKeys[this.controls.down]) {
      if (this.platform) {
        this.platformOffset.y += Constants.PLAYER_STEP_SIZE
      } else {
        this.position.y = Math.min(Constants.GRID_DIMENSIONS.HEIGHT - 1, this.position.y + Constants.PLAYER_STEP_SIZE)
      }
    }

    // check if you left the platform
    if (this.platform) {
      this.position.x = this.platform.position.x + this.platformOffset.x
      this.position.y = this.platform.position.y + this.platformOffset.y
    }

    const colocatedEntities = this.game.board.getEntitiesAtPosition(this.position.x, this.position.y)
    const resultingActions = {}
    if (colocatedEntities.length) {
      for (const entity of colocatedEntities) {
        if (entity != this) {
          const actions = entity.onContact(this)
          for (const action of actions) {
            resultingActions[action] = entity
          }
        }
      }
    }

    this.processActions(resultingActions)

    this.render()
  }

  render() {
    Utils.renderAtGridLocation(this.context, this.position.x, this.position.y)
  }

  /**
   * Processes all actions that resulted from contact with another entity on the board.
   * Updates position and state of player based on these actions.
   */
  processActions(resultingActions) {
    if (resultingActions[Constants.PLAYER_ACTIONS.RESTART]) {
      this.restart()
      return // ignore all other actions
    }

    if (resultingActions[Constants.PLAYER_ACTIONS.BLOCK]) {
      this.position = this.prevPosition
    } else {
      this.game.board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y)
    }

    const toyEntity = resultingActions[Constants.PLAYER_ACTIONS.ADD_TOY_PART]
    if (toyEntity) {
      this.addToyPart(toyEntity.config.partType)
    }

    if (resultingActions[Constants.PLAYER_ACTIONS.ACCEPT_TOY]) {
      this.clearToyParts()

      // temporary
      this.context.classList.add('is-winner')
    }

    const platform = resultingActions[Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
    if (platform) {
      this.platform = platform
      this.platformOffset = {
        x: this.position.x - platform.position.x,
        y: this.position.y - platform.position.y
      }
    }
  }

  onContact(player) {
    return [Constants.PLAYER_ACTIONS.BOUNCE]
  }

  addToyPart(toyPart) {
    if (this.toyParts.indexOf(toyPart) == -1) {
      this.toyParts.push(toyPart)
      this.context.classList.add(`toypart--${toyPart}`)
    }
  }

  clearToyParts() {
    for (const toyPart of this.toyParts) {
      this.context.classList.remove(`toypart--${toyPart}`)
    }

    this.toyParts = []
  }
}
