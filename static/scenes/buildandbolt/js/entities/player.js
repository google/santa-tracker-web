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

  init(config) {
    this.config = config

    this.toyParts = []

    this.platform = null

    this.resetPosition()

    Utils.renderAtGridLocation(this.spawnElem, this.position.x, this.position.y)
    this.game.board.addEntityToBoard(this, this.position.x, this.position.y)
  }

  /**
   * Restarts the player to the beginning of the level, progress lost
   */
  restart() {
    // this.elem.classList.add('is-hidden')
    this.dead = true
    this.currentAnimationFrame = Constants.PLAYER_FRAMES.DEATH.start
    this.currentAnimationState = Constants.PLAYER_FRAMES.DEATH
    this.animationQueue = []
    this.animations['death'].renderer.svgElement.classList.add('is-active')

    window.setTimeout(() => {
      this.dead = false

      this.animations['death'].renderer.svgElement.classList.remove('is-active')

      this.resetPosition()

      this.clearToyParts()

      this.game.board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y)

      this.elem.classList.remove('is-hidden')
    }, 500)
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

    this.currentAnimationFrame = 1
    this.currentAnimationState = Constants.PLAYER_FRAMES.REST
    this.playerState = Constants.PLAYER_STATES.REST
    this.setDirection('front')
    this.animationQueue = []

    this.onIce = false
  }

  onFrame(delta, now) {
    if (this.dead) {
      this.updateAnimationFrame(now)
      this.render()
      return
    }

    this.blockPlayer = false
    this.prevPosition = Object.assign({}, this.position)

    let isDecelerating = false
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
      this.setDirection('left')
    } else if (this.velocity.x < 0) {
      this.velocity.x = Math.min(0, this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.right)) {
      this.velocity.x = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('right')
    } else if (this.velocity.x > 0) {
      this.velocity.x = Math.max(0, this.velocity.x - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.up)) {
      this.velocity.y = Math.max(-Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('back')
    } else if (this.velocity.y < 0) {
      this.velocity.y = Math.min(0, this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      isDecelerating = true
    }

    if (this.gameControls.isKeyControlActive(this.controls.down)) {
      this.velocity.y = Math.min(Constants.PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y + Constants.PLAYER_ACCELERATION_STEP * accelerationFactor)
      this.setDirection('front')
    } else if (this.velocity.y > 0) {
      this.velocity.y = Math.max(0, this.velocity.y - Constants.PLAYER_ACCELERATION_STEP * decelerationFactor)
      isDecelerating = true
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

    this.blockingPosition = {
      x: this.position.x,
      y: this.position.y,
    }

    const surroundingEntities = this.game.board.getSurroundingEntities(this)

    const resultingActions = {}

    if (surroundingEntities.length) {
      for (const entity of surroundingEntities) {
        this.checkActions(entity, resultingActions)
      }
    }

    this.processActions(resultingActions)

    this.movePlayer()


    // TODO: play the correct state
    const restThreshold = Constants.PLAYER_ACCELERATION_STEP * 8
    if ((this.velocity.x == 0 && this.velocity.y == 0) ||
        (isDecelerating && Math.abs(this.velocity.x) <= restThreshold && Math.abs(this.velocity.y) <= restThreshold)) {
      this.setPlayerState(Constants.PLAYER_STATES.REST)
    } else {
      this.setPlayerState(Constants.PLAYER_STATES.WALK)
    }
    this.updateAnimationFrame(now)

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

  checkActions(entity, resultingActions) {
    const actions = entity.onContact(this)

    for (const action of actions) {
      if (!resultingActions[action]) { // if this action is not referred yet, create it
        resultingActions[action] = []
      }
      resultingActions[action].push(entity)
    }
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

  setPlayerState(state) {
    if (state == this.playerState) {
      return
    }

    switch(state) {
      case Constants.PLAYER_STATES.WALK:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.REST:
            this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.REST_TO_WALK)
            // break;
          default:
            this.playerState = Constants.PLAYER_STATES.WALK
            this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.WALK)
        }
        break;
      case Constants.PLAYER_STATES.REST:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.WALK:
            this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.WALK_TO_REST)
            // break;
          default:
            this.playerState = Constants.PLAYER_STATES.REST
            this.animationQueue.push(Constants.PLAYER_FRAMES.REST)
        }
        break;
    }
    // Add only once. Add transition states. Clear queue if needed.
    // Rest
    // Walk
    // Hold and rest
    // Hold and walk
  }

  /**
   * Checks for repeats to make sure the animation is not queued multiple times
   */
  addAnimationToQueueOnce(animation) {
    if (this.animationQueue.indexOf(animation) < 0) {
      this.animationQueue.push(animation)
    }
  }

  updateAnimationFrame(now) {
    // Frame is not within range. Set it to start of range.
    if (this.currentAnimationFrame < this.currentAnimationState.start ||
        this.currentAnimationFrame > this.currentAnimationState.end) {
      this.currentAnimationFrame = this.currentAnimationState.start
      this.lastAnimationFrame = now
      return
    }

    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now
    }

    // TODO: use utils method

    const fps = 60
    const frameDelta = Math.round(fps / 1000 * (now - this.lastAnimationFrame))

    if (frameDelta >= 1) {
      // Play the animation in a loop
      if (this.currentAnimationState.loop && !this.animationQueue.length) {
        const animationLength = this.currentAnimationState.end - this.currentAnimationState.start + 1
        const currentOffset = this.currentAnimationFrame - this.currentAnimationState.start
        this.currentAnimationFrame = this.currentAnimationState.start + ((currentOffset + frameDelta) % animationLength)
        this.lastAnimationFrame = now
        return
      }

      // Play the animation to the end, then start next animation.
      this.currentAnimationFrame = Math.min(this.currentAnimationFrame + frameDelta, this.currentAnimationState.end)
      this.lastAnimationFrame = now
      if (this.currentAnimationFrame == this.currentAnimationState.end) {
        if (this.animationQueue.length) {
          this.currentAnimationState = this.animationQueue.shift()
        }
      }
    }
  }
}
