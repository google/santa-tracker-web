goog.provide('app.GameManager')

goog.require('Constants')

// singleton to manage the game
class GameManager {
  constructor() {
    this._players = []
  }

  get players() {
    return this._players;
  }

  set players(value) {
    this._players = value;
  }
}

app.GameManager = new GameManager()
