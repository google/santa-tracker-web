goog.provide('app.Player');

goog.require('Constants');

app.Player = class Player {
  constructor(game, context, config) {
    this.game = game
    this.gameControls = game.controls
    this.context = context
    this.controls = config.controls

    this.position = {
      x: config.startPos.x,
      y: config.startPos.y,
      angle: 0
    }
  }

  reset() {
  }

  onFrame(delta) {
    console.log('player frame')

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

    this.render()
  }

  render() {
    this.context.style.transform =
      `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotateZ(${this.position.angle}deg)`
  }
}
