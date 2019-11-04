goog.provide('app.Game')

goog.require('Constants')
goog.require('Levels')

goog.require('app.Board')
goog.require('app.Controls')
goog.require('app.Entity')
goog.require('app.Pit')
goog.require('app.Player')

app.Game = class Game {
  constructor(context) {
    this.context = context
    this.board = new app.Board(document.getElementById('board'))
    this.controls = new app.Controls(this)
    this.entities = []
    this.players = []

    this.players[0] = new app.Player(this, document.getElementById('player-1'),
        Constants.PLAYER_CONTROLS.ARROWS)
    this.players[1] = new app.Player(this, document.getElementById('player-2'),
        Constants.PLAYER_CONTROLS.WASD)

    this.initLevel(0)

    this.isPlaying = true
    this.lastFrame = +new Date() / 1000

    this.onFrame()
  }

  initLevel(level) {
    let levelConfig = Levels[level]
    this.players[0].init(levelConfig.players[0])
    this.players[1].init(levelConfig.players[1])

    for (const entity of levelConfig.entities) {
      switch(entity.type) {
        case 'pit':
          this.entities.push(new app.Pit(entity.position))
          break;
      }
    }
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

    for (const player of this.players) {
      player.onFrame(delta)
    }

    for (const entity of this.entities) {
      entity.onFrame(delta)
    }

    this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
  }
}
