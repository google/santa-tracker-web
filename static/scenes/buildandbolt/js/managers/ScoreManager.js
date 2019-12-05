goog.provide('app.ScoreManager')

goog.require('Constants')

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
        index: i,
        global: 0,
        toysInLevel: 0,
        toys: []
      }
    }
  }

  score(id, toy) {
    this.scoresDict[id].global++
    this.scoresDict[id].toys.push(toy)

    console.log(this.scoresDict[id])
  }

  // score(id) {
  //   const playerIndex = this._playersDict[id].index
  //   const player = this._players[playerIndex]
  //   player.registerWin()

  //   if (Levels[this._currentLevel].nbToys === this._playersDict[id].scoreInLevel) {
  //     if (!this.game.levelWinner) {
  //       this.game.levelWinner = player

  //       // Todo: Display level winner screen

  //       this.game.goToNextLevel()
  //     }
  //   }
  // }

  // initLevel(toyType) {
  //   const keys = Object.keys(this.players)
  //   for (const key of keys) {
  //     const player = this.players[key]
  //     // reset scores to 0
  //     this._playersDict[id].scoreInLevel = 0
  //     this.ui.numbers[player.index].innerHTML = player.score

  //     // update toy images
  //     this.ui.toyImages[player.index].src = `img/toys/${toyType}/full.svg`
  //   }
  // }

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
