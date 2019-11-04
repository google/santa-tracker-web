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
    this.position = {
      x: Utils.gridToPixelValue(config.startPos.x),
      y: Utils.gridToPixelValue(config.startPos.y),
      angle: 0
    }
  }

  onFrame(delta) {
    // if (this.game.pit.intersects(this)) {
    //   this.context.style.display = 'none'
    // }

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
    // TODO: move this to a common util class
    this.context.style.transform =
      `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotateZ(${this.position.angle}deg)`
  }
}
