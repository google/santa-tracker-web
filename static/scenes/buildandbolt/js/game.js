goog.provide('app.Game')

goog.require('Constants')
goog.require('Levels')

goog.require('app.Board')
goog.require('app.ControlsManager')
goog.require('app.Entity')
goog.require('app.Fence')
goog.require('app.Gui')
goog.require('app.Ice')
goog.require('app.LevelManager')
goog.require('app.Penguin')
goog.require('app.Pit')
goog.require('app.Platform')
goog.require('app.Player')
goog.require('app.PresentBox')
goog.require('app.ScoreManager')
goog.require('app.ScoreScreen')
goog.require('app.Table')
goog.require('app.ToysBoard')
goog.require('app.Wall')
goog.require('app.shared.utils')
goog.require('app.shared.Gameover')
goog.require('app.shared.Scoreboard')
goog.require('app.AnimationManager')


app.Game = class Game {
  constructor(context, api, prepareAnimation) {
    if (Constants.DEBUG) {
      document.getElementsByTagName('body')[0].classList.add('debug')
    }

    this.context = context

    this.gui = new app.Gui(this)

    // we have to do that because we can't mix an `import api from '../../src/scene/api.js'` and goog.provide()
    app.AnimationManager.init(api, prepareAnimation)

    // preload players animations
    this.initPlayersAnimations()
  }

  initPlayersAnimations() {
    const apiPreload = true

    const initPlayerAnimation = (path, playerId, side) => {
      const container = document.querySelector(`.player--${playerId} .player__inner`)
      app.AnimationManager.prepareAnimation(path, container, side, (anim) => {
        if (!app.AnimationManager.animations[`player-${playerId}`]) {
          app.AnimationManager.animations[`player-${playerId}`] = {}
        }

        app.AnimationManager.animations[`player-${playerId}`][side] = anim
      }, apiPreload)
    }

    initPlayerAnimation('img/players/a/front.json', 'a', 'front')
    initPlayerAnimation('img/players/a/back.json', 'a', 'back')
    initPlayerAnimation('img/players/a/side.json', 'a', 'side')
    initPlayerAnimation('img/players/death-pow.json', 'a', 'death')
    initPlayerAnimation('img/players/b/front.json', 'b', 'front')
    initPlayerAnimation('img/players/b/back.json', 'b', 'back')
    initPlayerAnimation('img/players/b/side.json', 'b', 'side')
    initPlayerAnimation('img/players/death-pow.json', 'b', 'death')
  }

  init(playerOption) {
    this.players = []
    this.entities = []

    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.players.push(new app.Player(Constants.PLAYER_CONTROLS.SINGLE, 'a'))
      this.multiplayer = false
    } else {
      this.players.push(new app.Player(Constants.PLAYER_CONTROLS.ARROWS, 'a'))
      this.players.push(new app.Player(Constants.PLAYER_CONTROLS.WASD, 'b'))
      this.multiplayer = true
    }

    // init managers and components
    app.ControlsManager.init(this)
    app.ScoreManager.init(this)
    app.LevelManager.init(this, document.getElementsByClassName('levelup')[0],
        document.querySelector('.levelup--number'), this.startLevel.bind(this))
    // init components
    app.ToysBoard.init(document.querySelector('[data-toys-board]'), playerOption)
    app.Board.init(document.querySelector('[data-board]'))
    app.ScoreScreen.init(this, document.querySelector('[data-score-screen]'), playerOption)
    // init sharedComponents
    this.gameoverDialog = new app.shared.Gameover(this)
    this.scoreboard = new app.shared.Scoreboard(this, null, Levels.length)

    this.isPlaying = false
    this.lastFrame = null

    window.santaApp.fire('sound-trigger', 'buildandbolt_level_end');
    app.LevelManager.show()

    this.onFrame()
  }

  startLevel() {
    this.initLevel()
    this.scoreboard.setLevel(app.LevelManager.current)
    this.unfreezeGame()

    if (app.LevelManager.current === 0) {
      setTimeout(()=>{
        window.santaApp.fire('sound-trigger', 'buildandbolt_game_start');
        window.santaApp.fire('sound-trigger', 'buildandbolt_chord');
      }, 800)
    } else {
      window.santaApp.fire('sound-trigger', 'buildandbolt_game_start');
    }
  }


  initLevel() {
    let levelConfig = Levels[app.LevelManager.current]
    this.scoreboard.restart()
    this.scoreboard.addTime(levelConfig.time)
    this.hurryupMusicTime = levelConfig.hurryUpMusicTime || 15;
    this.levelWinner = null
    // app.ToysBoard.initLevel(levelConfig.toyType.key)

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
          if (this.multiplayer || entity.config.playerId == 'a') {
            this.entities.push(app.PresentBox.pop(this, entity.config))
          }
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

        let playerCollision = false

        for (const player of this.players) {
          player.onFrame(delta, now)

          if (player.isCloseToOtherPlayer) {
            playerCollision = true
          }
        }

        if (playerCollision) {
          this.detectPlayerCollision()
        }

        this.scoreboard.onFrame(delta / 1000)

        if (this.scoreboard.countdown < this.hurryupMusicTime && !this.hurryUpPlayed) {
          window.santaApp.fire('sound-trigger', 'buildandbolt_hurryup');
          this.hurryUpPlayed = true;
        }
      }
    }

    this.rafId = window.requestAnimationFrame(this.onFrame.bind(this))
  }

  detectPlayerCollision() {
    if (this.playerCollision) return
    const player1 = this.players[0]
    const player2 = this.players[1]
    const { GRID_DIMENSIONS, PLAYER_PUSH_FORCE, PLAYER_BOUNCE_FORCE } = Constants

    const collisionDistance = Math.hypot(player1.position.x - player2.position.x, player1.position.y - player2.position.y)

    if (collisionDistance < 1) {
      // this prevent detecting collision issues
      this.playerCollision = true
      setTimeout(() => {
        this.playerCollision = false
      }, 100)

      // prevent having two players on the same cell
      // e.g. Player 1 is in the starting cell of the player 2. Then player 2 die and restart on his starting cell,
      // both players will be in the same cell and create bugs
      if (collisionDistance <= 0.5) {
        // console.log('wrong')
        // move both players in the next left/right cell
        player1.position.x = Math.min(GRID_DIMENSIONS.WIDTH - 1, Math.max(0, player1.position.x + 1))
        player2.position.x = Math.min(GRID_DIMENSIONS.WIDTH - 1, Math.max(0, player2.position.x - 1))
        return
      }

      const player1Speed = player1.getSpeed()
      const player2Speed = player2.getSpeed()

      if (Math.abs(player1Speed - player2Speed) < PLAYER_BOUNCE_FORCE) { // if speeds are relatively the same
        // tie, both players are boucing against each other woth the same force
        for (let i = 0; i < this.players.length; i++) {
          const player = this.players[i]
          // get direction angle
          const angle = player.getDirectionAngle()
          // bump player (oposite direction)
          player.bump(angle, PLAYER_PUSH_FORCE, -1)
        }
      } else {
        // the fastest player will push the other player (and bounce a little bit)
        const fastPlayer = player1Speed > player2Speed ? player1 : player2
        const slowPlayer = player1Speed < player2Speed ? player1 : player2
        const angle = fastPlayer.getDirectionAngle()
        // bump other player
        slowPlayer.bump(angle, PLAYER_PUSH_FORCE, 1)

        // bump current player (oposite direction)
        fastPlayer.bump(angle, PLAYER_BOUNCE_FORCE, -1)
      }
    }
  }

  reset() {
    app.Board.reset()
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

  goToNextLevel() {
    this.reset()
    this.resume()

    if (app.LevelManager.current < Levels.length - 1) {
      app.LevelManager.goToNext()
      app.LevelManager.show()
      app.ToysBoard.updateLevel()
      window.santaApp.fire('sound-trigger', 'buildandbolt_levelup');
    } else {
      // end game. display game winner.
      this.gameoverDialog.show()
      window.santaApp.fire('sound-trigger', 'buildandbolt_win');

      //timeout to prevent walk loop to start after game has ended
      setTimeout(()=>{
        window.santaApp.fire('sound-trigger', 'buildandbolt_player_walk_stop', 'all');
      }, 10)

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

  /**
   * Called by the scoreboard to stop the game when the time is up.
   */
  gameover() {
    app.ScoreScreen.show()
  }

  /**
   * Called when global pause button is clicked.
   */
  pause() {
    this.freezeGame()
  }

  /**
   * Called when resume button is clicked.
   */
  resume() {
    this.unfreezeGame()
  }

  /**
   * Called when global restart button is clicked.
   */
  restart() {
    this.freezeGame()
    this.reset()
    app.LevelManager.reset()
    app.LevelManager.show()
    app.ScoreManager.reset()
    app.ScoreManager.hide()
  }

  freezeGame() {
    this.isPlaying = false
  }

  unfreezeGame() {
    if (!this.isPlaying) {
      this.lastFrame = null
      this.isPlaying = true
    }
  }
}
