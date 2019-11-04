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
      const prevPosition = Object.assign({}, this.position)
      this.position = {
        x: this.config.startPos.x,
        y: this.config.startPos.y,
        angle: 0
      }

      this.game.board.updateEntityPosition(this,
          Math.round(prevPosition.x), Math.round(prevPosition.y),
          Math.round(this.position.x), Math.round(this.position.y))

      this.context.classList.remove('is-hidden')
    }, 1000)
  }

  onFrame(delta) {
    // check what else is on this grid spot
    // report position to board

    const prevPosition = Object.assign({}, this.position)

    if (this.gameControls.trackedKeys[this.controls.left]) {
      this.position.x -= Constants.PLAYER_STEP_SIZE
    }

    if (this.gameControls.trackedKeys[this.controls.right]) {
      this.position.x += Constants.PLAYER_STEP_SIZE
    }

    if (this.gameControls.trackedKeys[this.controls.up]) {
      this.position.y -= Constants.PLAYER_STEP_SIZE
    }

    if (this.gameControls.trackedKeys[this.controls.down]) {
      this.position.y += Constants.PLAYER_STEP_SIZE
    }

    if (Math.round(prevPosition.x) != Math.round(this.position.x) ||
        Math.round(prevPosition.y) != Math.round(this.position.y)) {
      this.game.board.updateEntityPosition(this,
          Math.round(prevPosition.x), Math.round(prevPosition.y),
          Math.round(this.position.x), Math.round(this.position.y))
    }

    const colocatedEntities = this.game.board.getEntitiesAtPosition(Math.round(this.position.x), Math.round(this.position.y))
    const resultingActions = {}
    if (colocatedEntities.length > 1) {
      for (const entity of colocatedEntities) {
        if (entity != this) {
          const action = entity.onContact(this)
          resultingActions[action] = entity
        }
      }
    }

    this.processActions(resultingActions)

    // restart, stick to, bounce, stop, drop item,
    // add toy part, accept toy, slide

    this.render()
  }

  render() {
    Utils.renderAtGridLocation(this.context, this.position.x, this.position.y)
  }

  processActions(resultingActions) {
    if (resultingActions[Constants.PLAYER_ACTIONS.RESTART]) {
      this.restart()
    }
  }
}
