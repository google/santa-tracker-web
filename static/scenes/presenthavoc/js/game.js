goog.provide('app.Game')

goog.require('app.Controls')
goog.require('app.Player')
goog.require('Constants')

app.Game = class Game {
  constructor(context) {
    this.context = context
    this.controls = new app.Controls(this)
    this.player1 = new app.Player(this, document.getElementById('player-1'), {
        controls: Constants.PLAYER_CONTROLS.ARROWS,
        startPos: {
          x: 1350,
          y: 0
        }
      })
    this.player2 = new app.Player(this, document.getElementById('player-2'), {
        controls: Constants.PLAYER_CONTROLS.WASD,
        startPos: {
          x: 0,
          y: 0
        }
      })

    this.isPlaying = true
    this.lastFrame = +new Date() / 1000

    this.onFrame()
  }

  onFrame() {
    if (!this.isPlaying) {
      return
    }

    // Calculate delta
    var now = +new Date() / 1000,
      delta = now - this.lastFrame
    this.lastFrame = now
    // this.timePassed += delta
    this.player1.onFrame(delta)
    this.player2.onFrame(delta)

    this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
  }
}
