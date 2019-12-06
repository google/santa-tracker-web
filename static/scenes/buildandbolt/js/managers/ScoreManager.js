goog.provide('app.ScoreManager')

goog.require('Constants')

goog.require('app.LevelManager')
goog.require('app.ScoreScreen')
goog.require('app.ToysBoard')

// singleton to manage the game
class ScoreManager {
  constructor() {
    this.scoresDict = {} // store players' score by player's ids
  }

  init(game) {
    this.game = game
    this.initScoresDict()
  }

  initScoresDict() {
    // create a dictionnary of players with their current scores
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i]
      this.scoresDict[player.id] = {
        toysInLevel: 0,
        toys: [],
      }
    }
  }

  updateScore(id) {
    const { toyType, toysCapacity } = app.LevelManager
    const player = this.scoresDict[id]
    player.toysInLevel++
    player.toys.push(toyType.key)
    // update toys board
    app.ToysBoard.updateScore(id, toysCapacity - player.toysInLevel)
    // update score screen
    app.ScoreScreen.updateScore(id, player.toys.length, toyType.key)

    window.santaApp.fire('sound-trigger', 'buildandbolt_yay_2', id)

    if (player.toysInLevel === toysCapacity) {
      // reset toysInLevels
      this.resetToysInLevels()
      // show winner screen
      app.ScoreScreen.show()
    }
  }

  resetToysInLevels() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i]
      this.scoresDict[player.id].toysInLevel = 0
    }
  }
}

app.ScoreManager = new ScoreManager()
