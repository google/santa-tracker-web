goog.provide('app.Player')

goog.require('Constants')
goog.require('Utils')

app.Player = class Player {
  constructor(game, controls, id) {
    this.game = game
    this.gameControls = game.controls
    this.animations = this.game.animations[`player-${id}`]
    this.controls = controls
    this.score = 0
    this.toyParts = []

    this.elem = document.createElement('div')
    document.getElementById('players').append(this.elem)
    this.elem.setAttribute('class', `player player--${id}`)

    this.innerElem = document.createElement('div')
    this.innerElem.setAttribute('class', `player__inner`)
    this.elem.appendChild(this.innerElem)

    this.innerElem.appendChild(this.animations['death'].renderer.svgElement)
    this.innerElem.appendChild(this.animations['front'].renderer.svgElement)
    this.innerElem.appendChild(this.animations['back'].renderer.svgElement)
    this.innerElem.appendChild(this.animations['side'].renderer.svgElement)

    this.spawnElem = document.createElement('div')
    document.getElementById('players').append(this.spawnElem)
    this.spawnElem.setAttribute('class', `player-spawn player-spawn--${id}`)
  }

  /**
   * Initializes player for the start of each level
   */
  init(config) {
    this.config = config

    this.resetPosition()

    Utils.renderAtGridLocation(this.spawnElem, this.position.x, this.position.y)
    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  /**
   * Restarts the player to the beginning of the level, progress lost
   */
  restart() {
    this.dead = true
    this.animationQueue = []

    // initialize death animation
    this.animations['death'].renderer.svgElement.classList.add('is-active')
    this.innerElem.classList.add('is-dead')
    this.currentAnimationFrame = Constants.PLAYER_FRAMES.DEATH.start
    this.currentAnimationState = {
      animation: Object.assign({repeat: 2}, Constants.PLAYER_FRAMES.DEATH),
      callback: () => {
        this.dead = false
        this.animations['death'].renderer.svgElement.classList.remove('is-active')
        this.innerElem.classList.remove('is-dead')

        this.resetPosition()

        this.game.board.updateEntityPosition(this,
            this.prevPosition.x, this.prevPosition.y,
            this.position.x, this.position.y)
      }
    }
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

    this.clearToyParts()
    this.platform = null
    this.onIce = false

    this.currentAnimationFrame = Constants.PLAYER_FRAMES.REST.start
    this.currentAnimationState = {
      animation: Constants.PLAYER_FRAMES.REST
    }
    this.playerState = Constants.PLAYER_STATES.REST
    this.setDirection('front')
    this.animationQueue = []
  }

  onFrame(delta, now) {
    if (this.dead) {
      // Keep updating death animation
      this.updateAnimationFrame(now)
      this.render()
      return
    }

    this.blockPlayer = false
    this.blockingPosition = {
      x: this.position.x,
      y: this.position.y,
    }

    this.prevPosition = Object.assign({}, this.position)

    this.updatePosition(delta)
    this.checkActions()


    // TODO: play the correct state
    const restThreshold = Constants.PLAYER_ACCELERATION_STEP * 8
    if ((this.velocity.x == 0 && this.velocity.y == 0) ||
        (this.isDecelerating && Math.abs(this.velocity.x) <= restThreshold && Math.abs(this.velocity.y) <= restThreshold)) {
      this.setPlayerState(Constants.PLAYER_STATES.REST)
    } else {
      this.setPlayerState(Constants.PLAYER_STATES.WALK)
    }
    this.updateAnimationFrame(now)

    this.movePlayer()
    this.render()
  }

  render() {
    if (this.dead) {
      this.animations['death'].goToAndStop(this.currentAnimationFrame, true)
    } else {
      this.animations[this.currentDirection].goToAndStop(this.currentAnimationFrame, true)
    }
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  /**
   * Updates player position and velocity based on user controls
   */
  updatePosition(delta) {
    this.isDecelerating = false

    let accelerationFactor = Constants.PLAYER_ACCELERATION_FACTOR
    let decelerationFactor = Constants.PLAYER_DECELERATION_FACTOR
    if (this.onIce) {
      accelerationFactor = Constants.PLAYER_ICE_ACCELERATION_FACTOR
      decelerationFactor = Constants.PLAYER_ICE_DECELERATION_FACTOR
      this.onIce = false // only leave it on for one step
    }

    if (this.gameControls.isKeyControlActive(this.controls.left)) {
      this.velocity.x = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('left')
    } else if (this.velocity.x < 0) {
      this.velocity.x = Math.min(0, this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      this.isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.right)) {
      this.velocity.x = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('right')
    } else if (this.velocity.x > 0) {
      this.velocity.x = Math.max(0, this.velocity.x - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      this.isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.up)) {
      this.velocity.y = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('back')
    } else if (this.velocity.y < 0) {
      this.velocity.y = Math.min(0, this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      this.isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.down)) {
      this.velocity.y = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('front')
    } else if (this.velocity.y > 0) {
      this.velocity.y = Math.max(0, this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      this.isDecelerating = true
    }

    if (this.platform) {
      this.platformOffset.x += this.velocity.x * delta
      this.platformOffset.y += this.velocity.y * delta
    } else {
      this.position.x = Math.min(Constants.GRID_DIMENSIONS.WIDTH - 1,
          Math.max(0, this.position.x + this.velocity.x * delta))

      this.position.y = Math.min(Constants.GRID_DIMENSIONS.HEIGHT - 1,
          Math.max(0, this.position.y + this.velocity.y * delta))
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
  }

  movePlayer() {
    // if block player is blocked
    if (this.blockPlayer) {
      this.position.x = this.blockingPosition.x
      this.position.y = this.blockingPosition.y
      this.velocity.x = 0
      this.velocity.y = 0
    }
    // move player
    this.game.board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y)
  }

  /**
   * Check for any effects other entities have on the player at the
   * current position
   */
  checkActions() {
    const surroundingEntities = this.game.board.getSurroundingEntities(this)
    const resultingActions = {}

    for (const entity of surroundingEntities) {
      const actions = entity.onContact(this)

      for (const action of actions) {
        if (!resultingActions[action]) { // if this action is not referred yet, create it
          resultingActions[action] = []
        }
        resultingActions[action].push(entity)
      }
    }

    this.processActions(resultingActions)
  }

  processActions(resultingActions) {
    const restartEntities = resultingActions[Constants.PLAYER_ACTIONS.RESTART]
    if (restartEntities && restartEntities.length) {
      this.restart()
      return // ignore all other actions
    }

    // block player
    const blockEntities = resultingActions[Constants.PLAYER_ACTIONS.BLOCK]
    if (blockEntities && blockEntities.length) {
      for (const entity of blockEntities) {
        // block player
        if (entity.blockingPosition) {
          this.blockPlayer = true
          if (entity.blockingPosition.x !== this.position.x) {
            this.blockingPosition.x = entity.blockingPosition.x
          }
          if (entity.blockingPosition.y !== this.position.y) {
            this.blockingPosition.y = entity.blockingPosition.y
          }
        }
      }
    }

    // pick up a toy part
    const toyEntities = resultingActions[Constants.PLAYER_ACTIONS.ADD_TOY_PART]
    if (toyEntities && toyEntities.length) {
      for (const entity of toyEntities) {
        this.addToyPart(entity.config.partType)
      }
    }

    // drop off toy
    const acceptToyEntities = resultingActions[Constants.PLAYER_ACTIONS.ACCEPT_TOY]
    if (acceptToyEntities && acceptToyEntities.length) {
      this.setPlayerState(Constants.PLAYER_STATES.DROP_OFF)
      this.clearToyParts()

      // temporary
      this.game.registerToyCompletion(this)
    }

    const platforms = resultingActions[Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
    if (platforms && platforms.length) {
      const entity = platforms[0]
      this.platform = entity
      this.platformOffset = {
        x: this.position.x - entity.position.x,
        y: this.position.y - entity.position.y
      }
    }

    const ices = resultingActions[Constants.PLAYER_ACTIONS.ICE]
    if (ices && ices.length) {
      this.onIce = true
    }
  }

  addToyPart(toyPart) {
    if (this.toyParts.indexOf(toyPart) == -1) {
      this.toyParts.push(toyPart)

      if (this.toyParts.length == 1) {
        // transition to holding animation
        this.setPlayerState(Constants.PLAYER_STATES.PICK_UP)
      }

      this.elem.classList.add(`toypart--${toyPart}`)
    }
  }

  clearToyParts() {
    for (const toyPart of this.toyParts) {
      this.elem.classList.remove(`toypart--${toyPart}`)
    }

    this.toyParts = []
  }

  setDirection(direction) {
    if (direction == 'left') {
      this.innerElem.classList.add('is-flipped')
    } else {
      this.innerElem.classList.remove('is-flipped')
    }

    if (direction == 'left' || direction == 'right') {
      direction = 'side'
    }

    if (direction != this.currentDirection) {
      if (this.animations[this.currentDirection]) {
        this.animations[this.currentDirection].renderer.svgElement.classList.remove('is-active')
      }
      this.animations[direction].renderer.svgElement.classList.add('is-active')
      this.currentDirection = direction
    }
  }

  /**
   * Update animation based on player state
   */
  setPlayerState(state) {
    if (state == this.playerState) {
      return
    }

    let rest = Constants.PLAYER_FRAMES.REST
    let walk = Constants.PLAYER_FRAMES.WALK
    let restToWalk = Constants.PLAYER_FRAMES.REST_TO_WALK
    let walkToRest = Constants.PLAYER_FRAMES.WALK_TO_REST

    if (this.toyParts.length) {
      rest = Constants.PLAYER_FRAMES.HOLD_REST
      walk = Constants.PLAYER_FRAMES.HOLD_WALK
      restToWalk = Constants.PLAYER_FRAMES.HOLD_REST_TO_HOLD_WALK
      walkToRest = Constants.PLAYER_FRAMES.HOLD_WALK_TO_HOLD_REST
    }

    switch(state) {
      case Constants.PLAYER_STATES.WALK:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.REST:
            this.addAnimationToQueueOnce(restToWalk)
          default:
            this.playerState = Constants.PLAYER_STATES.WALK
            this.addAnimationToQueueOnce(walk)
        }
        break
      case Constants.PLAYER_STATES.REST:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.WALK:
            this.addAnimationToQueueOnce(walkToRest)
          default:
            this.playerState = Constants.PLAYER_STATES.REST
            this.animationQueue.push({
              animation: rest
            })
        }
        break
      case Constants.PLAYER_STATES.PICK_UP:
        this.playerState = Constants.PLAYER_STATES.PICK_UP
        this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.REST_TO_HOLD_REST, () => {
            console.log('add toy part')
        })
        break
      case Constants.PLAYER_STATES.DROP_OFF:
        this.playerState = Constants.PLAYER_STATES.DROP_OFF
          this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.HOLD_REST_TO_REST, () => {
            console.log('drop toy')
          })
        break
    }
  }

  /**
   * Checks for repeats to make sure the animation is not queued multiple times
   */
  addAnimationToQueueOnce(animation, callback) {
    if (!this.animationQueue.find(item => item.animation == animation)) {
      this.animationQueue.push({
        animation,
        callback
      })
    }
  }

  updateAnimationFrame(now) {
    let animation = this.currentAnimationState.animation

    // Frame is not within range. Set it to start of range.
    if (this.currentAnimationFrame < animation.start ||
        this.currentAnimationFrame > animation.end) {
      this.currentAnimationFrame = animation.start
      this.lastAnimationFrame = now
      return
    }

    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now
    }

    let loop = animation.loop && !this.animationQueue.length
    const {
      nextFrame,
      frameTime,
      finished
    } = Utils.nextAnimationFrame(animation,
        this.currentAnimationFrame, loop, this.lastAnimationFrame, now)

    this.currentAnimationFrame = nextFrame
    this.lastAnimationFrame = frameTime

    if (finished) {
      if (animation.repeat) {
        animation.repeat--
        this.currentAnimationFrame = animation.start
        return
      }

      if (this.currentAnimationState.callback) {
        this.currentAnimationState.callback.call(this)
      }

      if (this.animationQueue.length) {
        this.currentAnimationState = this.animationQueue.shift()
      } else {
        // No pending animations, go back to rest state
        this.setPlayerState(Constants.PLAYER_STATES.REST)
        if (this.animationQueue.length) {
          this.currentAnimationState = this.animationQueue.shift()
        }
      }
    }
  }

  onContact(player) {
    return [Constants.PLAYER_ACTIONS.BOUNCE]
  }

  registerWin() {
    this.score++
  }
}
