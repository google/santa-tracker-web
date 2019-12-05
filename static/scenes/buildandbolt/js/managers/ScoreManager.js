goog.provide('app.ScoreManager')

goog.require('Constants')

// singleton to manage the game
class ScoreManager {
  constructor() {
    this._players = []
    this._playersDict = {}
    this._currentLevel = 0
  }

  init(game) {
    this.game = game
    this.initPlayerDictionnary()
  }

  get players() {
    return this._players
  }

  set players(value) {
    this._players = value
  }

  initPlayerDictionnary() {
    // create a dictionnary of players with their current scores
    for (let i = 0; i < this._players.length; i++) {
      const player = this._players[i]
      this._playersDict[player.id] = {
        score: 0,
        scoreInLevel: 0,
        index: i,
      }
    }
  }

  score(id) {
    const playerIndex = this._playersDict[id].index
    const player = this._players[playerIndex]
    player.registerWin()

    if (Levels[this._currentLevel].nbToys === this._playersDict[id].scoreInLevel) {
      if (!this.game.levelWinner) {
        this.game.levelWinner = player

        // Todo: Display level winner screen

        this.game.goToNextLevel()
      }
    }
  }

  initLevel(toyType) {
    const keys = Object.keys(this.players)
    for (const key of keys) {
      const player = this.players[key]
      // reset scores to 0
      this._playersDict[id].scoreInLevel = 0
      this.ui.numbers[player.index].innerHTML = player.score

      // update toy images
      this.ui.toyImages[player.index].src = `img/toys/${toyType}/full.svg`
    }
  }

  // this will probably change
  registerToyCompletion(player) {
    // player.registerWin()

    // if (player.score)
    // if (!this.game.levelWinner) {
    //   this.game.levelWinner = player
    //   player.registerWin()

    //   // Todo: Display level winner screen

    //   this.game.goToNextLevel()
    // }
  }
}

app.ScoreManager = new ScoreManager()
