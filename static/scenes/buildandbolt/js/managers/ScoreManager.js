goog.provide('app.ScoreManager')

goog.require('Constants')

goog.require('app.LevelManager')

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
        total: 0,
        toysInLevel: 0,
        toys: [],
      }
    }
  }

  score(id) {
    const { toyType, toysCapacity } = app.LevelManager
    this.scoresDict[id].total++
    this.scoresDict[id].toysInLevel++
    this.scoresDict[id].toys.push(toyType.key)

    window.santaApp.fire('sound-trigger', 'buildandbolt_yay_2', this.id)

    if (this.scoresDict[id].toysInLevel === toysCapacity) {
      // reset toysInLevels
      this.resetToysInLevels()
      this.game.goToNextLevel()
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
