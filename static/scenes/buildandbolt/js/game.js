goog.provide('app.Game')

goog.require('Constants')
goog.require('Levels')

goog.require('app.Board')
goog.require('app.Controls')
goog.require('app.Entity')
goog.require('app.Fence')
goog.require('app.Gui')
goog.require('app.Ice')
goog.require('app.Penguin')
goog.require('app.Pit')
goog.require('app.Platform')
goog.require('app.Player')
goog.require('app.PresentBox')
goog.require('app.Table')
goog.require('app.Wall')
goog.require('app.shared.utils')
goog.require('app.shared.Gameover')
goog.require('app.shared.LevelUp')
goog.require('app.shared.Scoreboard')


app.Game = class Game {
  constructor(context, animations, prepareAnimation) {
    if (Constants.DEBUG) {
      document.getElementsByTagName('body')[0].classList.add('debug')
    }

    this.context = context
    this.animations = animations
    this.prepareAnimation = prepareAnimation

    this.gui = new app.Gui(this)
  }

  init(playerOption) {
    this.board = new app.Board(document.getElementById('board'))
    this.controls = new app.Controls(this)
    this.entities = []
    this.players = []

    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.players[0] = new app.Player(this, Constants.PLAYER_CONTROLS.SINGLE, 'a')
      this.multiplayer = false
    } else {
      this.players[0] = new app.Player(this, Constants.PLAYER_CONTROLS.ARROWS, 'a')
      this.players[1] = new app.Player(this, Constants.PLAYER_CONTROLS.WASD, 'b')
      this.multiplayer = true
    }

    this.levelUp = new LevelUp(this, document.getElementsByClassName('levelup')[0],
        document.querySelector('.levelup--number'));
    this.level = 0;

    this.gameoverDialog = new app.shared.Gameover(this)
    this.scoreboard = new Scoreboard(this, null, Levels.length)

    this.isPlaying = false
    this.lastFrame = null

    window.santaApp.fire('sound-trigger', 'buildandbolt_level_end');
    this.levelUp.show(this.level + 1, this.startLevel.bind(this))

    this.onFrame()
  }

  initLevel(level) {
    let levelConfig = Levels[level]
    this.scoreboard.addTime(levelConfig.time)
    this.levelWinner = null

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].init(levelConfig.players[i])
    }

    for (const entity of levelConfig.entities) {
      switch(entity.type) {
        case 'pit':
          this.entities.push(app.Pit.pop(this, entity.config))
          break;
        case 'penguin':
          this.entities.push(app.Penguin.pop(this, entity.config))
          break;
        case 'wall':
          this.entities.push(app.Wall.pop(this, entity.config))
          break;
        case 'fence':
          // Create an entity for each cell
          const { cells } = entity.config
          // rows
          for (let i = 0; i < cells.length; i++) {
            // columns in row
            for (let j = 0; j < cells[i].length; j++) {
              const config = {
                ...cells[i][j], // need that for the Entity onInit
                cells,
                row: i,
                column: j,
                x: entity.config.x + j, // need that for the Entity onInit
                y: entity.config.y + i
              }
              this.entities.push(app.Fence.pop(this, config))
            }
          }
          break;
        case 'table':
          this.entities.push(app.Table.pop(this, entity.config))
          break;
        case 'present-box':
          this.entities.push(app.PresentBox.pop(this, entity.config))
          break;
        case 'platform':
          this.entities.push(app.Platform.pop(this, entity.config))
          break;
        case 'ice':
          this.entities.push(app.Ice.pop(this, entity.config))
          break;
      }
    }
  }

  startLevel() {
    this.initLevel(this.level)
    this.scoreboard.setLevel(this.level)
    this.isPlaying = true

    if (this.level === 0) {
      setTimeout(()=>{
        window.santaApp.fire('sound-trigger', 'buildandbolt_game_start');
      }, 800)
    }else {
      window.santaApp.fire('sound-trigger', 'buildandbolt_levelup');
    }

  }

  onFrame(now) {
    if (this.isPlaying) {
      if (!this.lastFrame) {
        this.lastFrame = now
      } else {
        // Calculate delta
        var delta = now - this.lastFrame
        this.lastFrame = now
        // this.timePassed += delta

        for (const entity of this.entities) {
          entity.onFrame(delta, now)
        }

        for (const player of this.players) {
          player.onFrame(delta, now)
        }

        this.scoreboard.onFrame(delta / 1000)
      }
    }

    this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
  }

  registerToyCompletion(player) {
    if (!this.levelWinner) {
      this.levelWinner = player
      player.registerWin()
      this.isPlaying = false

      // Display level winner screen

      this.reset()

      this.level++
      if (this.level < Levels.length) {
        this.levelUp.show(this.level + 1, this.startLevel.bind(this))
      } else {
        // end game. display game winner.
        this.gameoverDialog.show()
        window.santaApp.fire('sound-trigger', 'buildandbolt_win');
        if (this.multiplayer) {
          if (this.players[0].score > this.players[1].score) {
            console.log('player 1 won')
          } else if (this.players[0].score < this.players[1].score) {
            console.log('player 2 won')
          } else {
            console.log('tie')
          }
        }
      }
    }
  }

  reset() {
    this.board.reset()
    for (const entity of this.entities) {
      if (entity instanceof app.Wall) {
        app.Wall.push(entity)
      } else if (entity instanceof app.Fence) {
        app.Fence.push(entity)
      } else if (entity instanceof app.Ice) {
        app.Ice.push(entity)
      } else if (entity instanceof app.Penguin) {
        app.Penguin.push(entity)
      } else if (entity instanceof app.Platform) {
        app.Platform.push(entity)
      } else if (entity instanceof app.Pit) {
        app.Pit.push(entity)
      } else if (entity instanceof app.PresentBox) {
        app.PresentBox.push(entity)
      } else if (entity instanceof app.Table) {
        app.Table.push(entity)
      }
    }

    this.entities = []
  }

  /**
   * Called by the scoreboard to stop the game when the time is up.
   */
  gameover() {
    console.log('gameover')
  }
}
