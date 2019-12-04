goog.provide('app.ScorePanel')

goog.require('app.shared.Scoreboard')

app.ScorePanel = class ScorePanel extends Scoreboard {
  constructor(game, elem, opt_levels) {
    super(game, elem, opt_levels)
    // console.log('tgggg!!!')
    console.log(this, elem)
    this.elem = elem

    // create players
  }

  init() {

  }
}