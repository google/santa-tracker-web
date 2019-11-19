goog.provide('app.Player')

goog.require('Constants')
goog.require('Utils')

app.Player = class Player {
  constructor(game, controls, id) {
    this.game = game
    this.gameControls = game.controls
    this.controls = controls
    this.score = 0

    this.elem = document.createElement('div')
    document.getElementById('players').append(this.elem)
    this.elem.setAttribute('class', 'player')
    this.elem.setAttribute('id', id)
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

    this.velocity = {
      x: 0,
      y: 0
    }

    this.acceleration = {
      x: 0,
      y: 0
    }

    this.onIce = false

    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  /**
   * Restarts the player to the beginning of the level, progress lost
   */
  restart() {
    this.elem.classList.add('is-hidden')
    this.dead = true

    window.setTimeout(() => {
      this.dead = false
      this.position = {
        x: this.config.startPos.x,
        y: this.config.startPos.y,
        angle: 0
      }

      this.velocity = {
        x: 0,
        y: 0
      }

      this.acceleration = {
        x: 0,
        y: 0
      }

      this.onIce = false

      this.clearToyParts()

      this.game.board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y)

      this.elem.classList.remove('is-hidden')
    }, 1000)
  }

  onFrame(delta) {
    if (this.dead) {
      return
    }

    this.prevPosition = Object.assign({}, this.position)

    let accelerationFactor = 1
    let decelerationFactor = 1
    if (this.onIce) {
      accelerationFactor = 2
      decelerationFactor = .5
      this.onIce = false // only leave it on for one step
    }

    if (this.gameControls.isKeyControlActive(this.controls.left)) {
      this.velocity.x = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity.x < 0) {
      this.velocity.x = Math.min(0, this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    if (this.gameControls.isKeyControlActive(this.controls.right)) {
      this.velocity.x = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity.x > 0) {
      this.velocity.x = Math.max(0, this.velocity.x - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    if (this.gameControls.isKeyControlActive(this.controls.up)) {
      this.velocity.y = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity.y < 0) {
      this.velocity.y = Math.min(0, this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    if (this.gameControls.isKeyControlActive(this.controls.down)) {
      this.velocity.y = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity.y > 0) {
      this.velocity.y = Math.max(0, this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    if (this.platform) {
      this.platformOffset.x += this.velocity.x
      this.platformOffset.y += this.velocity.y
    } else {
      this.position.x = Math.min(Constants.GRID_DIMENSIONS.WIDTH - 1,
          Math.max(0, this.position.x + this.velocity.x))

      this.position.y = Math.min(Constants.GRID_DIMENSIONS.HEIGHT - 1,
          Math.max(0, this.position.y + this.velocity.y))
    }

    // check if you left the platform
    if (this.platform) {
      this.position.x = this.platform.position.x + this.platformOffset.x
      this.position.y = this.platform.position.y + this.platformOffset.y

      if (this.platformOffset.x > 1 ||
          this.platformOffset.x < -1 ||
          this.platformOffset.y > 1 ||
          this.platformOffset.y < -1) {
        this.platform = null
      }
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
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
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

    // pick up a toy part
    const toyEntity = resultingActions[Constants.PLAYER_ACTIONS.ADD_TOY_PART]
    if (toyEntity) {
      this.addToyPart(toyEntity.config.partType)
    }

    // drop off toy
    if (resultingActions[Constants.PLAYER_ACTIONS.ACCEPT_TOY]) {
      this.clearToyParts()

      // temporary
      this.game.registerToyCompletion(this)
    }

    const platform = resultingActions[Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
    if (platform) {
      this.platform = platform
      this.platformOffset = {
        x: this.position.x - platform.position.x,
        y: this.position.y - platform.position.y
      }
    }

    if (resultingActions[Constants.PLAYER_ACTIONS.ICE]) {
      this.onIce = true
    }
  }

  onContact(player) {
    return [Constants.PLAYER_ACTIONS.BOUNCE]
  }

  addToyPart(toyPart) {
    if (this.toyParts.indexOf(toyPart) == -1) {
      this.toyParts.push(toyPart)
      this.elem.classList.add(`toypart--${toyPart}`)
    }
  }

  clearToyParts() {
    for (const toyPart of this.toyParts) {
      this.elem.classList.remove(`toypart--${toyPart}`)
    }

    this.toyParts = []
  }

  registerWin() {
    this.score++
  }
}
