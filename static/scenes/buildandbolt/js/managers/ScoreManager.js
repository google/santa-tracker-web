goog.provide('app.ScoreManager')

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

      if (this.game.multiplayer) {
        this.setWinner()
      }

      // show winner screen
      app.ScoreScreen.show()
    }
  }

  setWinner() {
    const { players } = this.game
    const characters = []
    for (let i = 0; i < players.length; i++) {
      characters.push({
        id: players[i].id,
        state: null
      })
    }
    if (this.scoresDict[players[0].id].toys.length > this.scoresDict[players[1].id].toys.length) {
      characters[0].state = 'win'
      characters[1].state = 'lose'
    } else if (this.scoresDict[players[0].id].toys.length < this.scoresDict[players[1].id].toys.length) {
      characters[0].state = 'lose'
      characters[1].state = 'win'
    } else {
      // tie
      characters[0].state = 'win'
      characters[1].state = 'win'
    }

    app.ScoreScreen.updateCharacters(characters)
  }

  resetToysInLevels() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i]
      this.scoresDict[player.id].toysInLevel = 0
    }
  }

  reset() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i]
      this.scoresDict[player.id].toysInLevel = 0
      this.scoresDict[player.id].toys = []
    }
  }
}

app.ScoreManager = new ScoreManager()
