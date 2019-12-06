goog.provide('app.ScoreScreen')

goog.require('Constants')

goog.require('app.shared.utils')
goog.require('Constants')

class ScoreScreen {
  init(game, elem, playerOption) {
    this.game = game
    this.elem = elem

    this.skip = this.skip.bind(this)

    this.dom = {
      skipButton: this.elem.querySelector('[data-score-screen-skip]'),
      players: this.elem.querySelectorAll('[data-score-screen-player]'),
    }

    // if single player
    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.dom.players[1].remove()
      this.elem.classList.add('single-player')
    }

    this.dom.skipButton.addEventListener('click', this.skip)
  }

  show() {
    // update levels
    this.elem.classList.remove('is-hidden')
  }

  updateScore(id, score) {
    // update score
    const domScore = this.elem.querySelector(`.score-screen__player--${id} .score-screen__score`)
    domScore.innerHTML = score
    console.log(score)
  }

  skip() {
    this.elem.classList.add('is-hidden')
    window.santaApp.fire('sound-trigger', 'generic_button_click')
    this.game.goToNextLevel()
  }
}


app.ScoreScreen = new ScoreScreen()