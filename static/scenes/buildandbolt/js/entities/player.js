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

    this.resetPosition()

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

      this.resetPosition()

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

      if (this.platformOffset.x > this.platform.config.width ||
          this.platformOffset.x < -1 ||
          this.platformOffset.y > this.platform.config.height ||
          this.platformOffset.y < -1) {
        this.platform = null
      }
    }

    const surroundingEntities = this.game.board.getSurroundingEntities(this)

    const entitiesInAction = []

    if (surroundingEntities.length) {
      for (const entity of surroundingEntities) {
        this.checkActions(entity, entitiesInAction)
      }
    }

    this.processActions(entitiesInAction)

    // block player
    if (this.blockPlayer) {
      this.position.x = this.blockingPosition.x
      this.position.y = this.blockingPosition.y
      this.velocity.x = 0
      this.velocity.y = 0
    } else {
      // move player
      this.game.board.updateEntityPosition(this,
            this.prevPosition.x, this.prevPosition.y,
            this.position.x, this.position.y)
    }



    this.render()
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  checkActions(entity, entitiesInAction) {
    const actions = entity.onContact(this)
    entity.actions = {}
    for (const action of actions) {
      entity.actions[action] = true
    }
    entitiesInAction.push(entity)
  }

  /**
   * Processes all actions that resulted from contact with another entity on the board.
   * Updates position and state of player based on these actions.
   */
  processActions(entitiesInAction) {
    this.blockPlayer = false
    this.blockingPosition = {
      x: this.position.x,
      y: this.position.y,
    }

    for (let i = 0; i < entitiesInAction.length; i++) {
      const entity = entitiesInAction[i]
      if (entity.actions[Constants.PLAYER_ACTIONS.RESTART]) {
        this.restart()
        return // ignore all other actions
      }

      // block player
      if (entity.actions[Constants.PLAYER_ACTIONS.BLOCK] && entity.blockingPosition) {
        this.blockPlayer = true
        if (entity.blockingPosition.x !== this.position.x) {
          this.blockingPosition.x = entity.blockingPosition.x
        }
        if (entity.blockingPosition.y !== this.position.y) {
          this.blockingPosition.y = entity.blockingPosition.y
        }
      }

      // pick up a toy part
      const toyEntity = entity.actions[Constants.PLAYER_ACTIONS.ADD_TOY_PART]
      if (toyEntity) {
        this.addToyPart(entity.config.partType)
      }

      // drop off toy
      if (entity.actions[Constants.PLAYER_ACTIONS.ACCEPT_TOY]) {
        this.clearToyParts()

        // temporary
        this.game.registerToyCompletion(this)
      }

      const platform = entity.actions[Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
      if (platform) {
        this.platform = entity
        this.platformOffset = {
          x: this.position.x - this.platform.position.x,
          y: this.position.y - this.platform.position.y
        }
      }

      if (entity.actions[Constants.PLAYER_ACTIONS.ICE]) {
        this.onIce = true
      }
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

  resetPosition() {
    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
      angle: 0
    }

    this.velocity = {
      x: 0,
      y: 0
    }

    this.onIce = false
  }
}
