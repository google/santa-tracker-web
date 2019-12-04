goog.provide('app.ScoreManager')

goog.require('Constants')

// singleton to manage the game
class ScoreManager {
  constructor() {
    this._players = []
  }

  init(game) {
    this.game = game
  }

  get players() {
    return this._players
  }

  set players(value) {
    this._players = value
  }

  // this will probably change
  registerToyCompletion(player) {
    if (!this.game.levelWinner) {
      this.game.levelWinner = player
      player.registerWin()

      // Todo: Display level winner screen

      this.game.goToNextLevel()
    }
  }
}

app.ScoreManager = new ScoreManager()
