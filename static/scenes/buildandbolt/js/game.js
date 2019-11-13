goog.provide('app.Game')

goog.require('Constants')
goog.require('Levels')

goog.require('app.Board')
goog.require('app.Controls')
goog.require('app.Entity')
goog.require('app.Fence')
goog.require('app.Ice')
goog.require('app.Penguin')
goog.require('app.Pit')
goog.require('app.Platform')
goog.require('app.Player')
goog.require('app.PresentBox')
goog.require('app.Table')
goog.require('app.Wall')
goog.require('app.shared.LevelUp');


app.Game = class Game {
  constructor(context, playerOption) {
    if (Constants.DEBUG) {
      document.getElementsByTagName('body')[0].classList.add('debug')
    }

    this.context = context
    this.board = new app.Board(document.getElementById('board'))
    this.controls = new app.Controls(this)
    this.entities = []
    this.players = []

    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      // Todo: create special single player controls
      this.players[0] = new app.Player(this, document.getElementById('player-1'),
          Constants.PLAYER_CONTROLS.ARROWS)
    } else {
      this.players[0] = new app.Player(this, document.getElementById('player-1'),
          Constants.PLAYER_CONTROLS.ARROWS)
      this.players[1] = new app.Player(this, document.getElementById('player-2'),
          Constants.PLAYER_CONTROLS.WASD)
    }

    this.levelUp = new LevelUp(this, document.getElementsByClassName('levelup')[0],
        document.querySelector('.levelup--number'));
    this.level = 0;

    this.isPlaying = false
    this.lastFrame = +new Date() / 1000

    this.initLevel(this.level)
    this.levelUp.show(this.level + 1, this.startLevel.bind(this))

    this.onFrame()
  }

  initLevel(level) {
    let levelConfig = Levels[level]

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].init(levelConfig.players[i])
    }

    for (const entity of levelConfig.entities) {
      switch(entity.type) {
        case 'pit':
          this.entities.push(new app.Pit(this, entity.config))
          break;
        case 'penguin':
          this.entities.push(new app.Penguin(this, entity.config))
          break;
        case 'wall':
          this.entities.push(new app.Wall(this, entity.config))
          break;
        case 'fence':
          this.entities.push(new app.Fence(this, entity.config))
          break;
        case 'table':
          this.entities.push(new app.Table(this, entity.config))
          break;
        case 'present-box':
          this.entities.push(new app.PresentBox(this, entity.config))
          break;
        case 'platform':
          this.entities.push(new app.Platform(this, entity.config))
          break;
        case 'ice':
          this.entities.push(new app.Ice(this, entity.config))
          break;
      }
    }
  }

  startLevel() {
    this.isPlaying = true
  }

  onFrame() {
    if (!this.isPlaying) {
      this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
      return
    }

    // Calculate delta
    var now = +new Date() / 1000,
      delta = now - this.lastFrame
    this.lastFrame = now
    // this.timePassed += delta

    for (const entity of this.entities) {
      entity.onFrame(delta)
    }

    for (const player of this.players) {
      player.onFrame(delta)
    }

    this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
  }
}
