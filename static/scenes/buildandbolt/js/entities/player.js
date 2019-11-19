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
      y: this.config.startPos.y
    }
    this.angle = this.config.startAngle
    this.velocity = 0
    this.acceleration = 0
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
        y: this.config.startPos.y
      }
      this.angle = this.config.startAngle
      this.velocity = 0
      this.acceleration = 0
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

    let accelerationFactor = Constants.PLAYER_ACCELERATION_FACTOR
    let decelerationFactor = Constants.PLAYER_DECELERATION_FACTOR
    let angleStepSize = Constants.PLAYER_ANGLE_STEP_SIZE
    if (this.onIce) {
      accelerationFactor = Constants.PLAYER_ACCELERATION_FACTOR_ICE
      decelerationFactor = Constants.PLAYER_DECELERATION_FACTOR_ICE
      angleStepSize = Constants.PLAYER_ANGLE_STEP_SIZE_ICE
      this.onIce = false // only leave it on for one step
    }

    if (this.gameControls.trackedKeys[this.controls.left]) {
      this.angle -= angleStepSize
    }

    if (this.gameControls.trackedKeys[this.controls.right]) {
      this.angle += angleStepSize
    }

    if (this.gameControls.trackedKeys[this.controls.up]) {
      this.velocity = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity > 0) {
      this.velocity = Math.max(0, this.velocity - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    if (this.gameControls.trackedKeys[this.controls.down]) {
      this.velocity = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
    } else if (this.velocity < 0) {
      this.velocity = Math.min(0, this.velocity + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
    }

    // calculate new position based on angle and velocity

    if (this.platform) {
      this.platformOffset = this.getNextPosition(this.platformOffset,
          this.velocity, this.angle)
    } else {
      this.position = this.getNextPosition(this.position, this.velocity,
          this.angle, true)
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

  getNextPosition(startPosition, velocity, angle, checkBounds = false) {
    let nextPosition = {}

    // calculate using trig
    nextPosition.x = startPosition.x + velocity * Math.cos(angle)
    nextPosition.y = startPosition.y + velocity * Math.sin(angle)

    if (checkBounds) {
      nextPosition.x = Math.min(Constants.GRID_DIMENSIONS.WIDTH - 1,
          Math.max(0, nextPosition.x))

      nextPosition.y = Math.min(Constants.GRID_DIMENSIONS.HEIGHT - 1,
          Math.max(0, nextPosition.y))
    }

    return nextPosition
  }

  render() {
    // temp
    let rotationOffset = .5 * Math.PI
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y, this.angle - rotationOffset)
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
