goog.provide('app.ToysBoard')

goog.require('Constants')

goog.require('app.LevelManager')

class ToysBoard {
  init(elem, playerOption) {
    this.elem = elem

    this.dom = {
      players: this.elem.querySelectorAll('[data-toys-board-player]'),
      toyImages: this.elem.querySelectorAll('[data-toys-board-toy]')
    }

    // if single player
    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.dom.players[1].remove()
      this.elem.classList.add('single-player')
    }

    this.updateLevel()
  }

  updateLevel() {
    const { toyType } = app.LevelManager
    for (let i = 0; i < this.dom.players.length; i++) {
      // update toy images
      this.dom.toyImages[i].src = `img/toys/${toyType.key}/full.svg`
    }
  }

  updateScore(id, score) {
    // update score
    const domNumber = this.elem.querySelector(`.toys-board__player--${id} .toys-board__number`)
    domNumber.innerHTML = score
  }
}


app.ToysBoard = new ToysBoard()