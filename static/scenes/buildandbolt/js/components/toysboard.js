goog.provide('app.ToysBoard')

goog.require('Constants')

goog.require('app.LevelManager')

class ToysBoard {
  init(elem, playerOption) {
    this.elem = elem

    this.dom = {
      players: this.elem.querySelectorAll('[data-toys-board-player]'),
      toyImages: this.elem.querySelectorAll('[data-toys-board-toy]'),
      score: this.elem.querySelectorAll('[data-toys-board-score]'),
    }

    // if single player
    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.dom.players[1].remove()
      this.elem.classList.add('single-player')
    }

    this.updateLevel()
  }

  updateLevel() {
    const { toyType, toysCapacity } = app.LevelManager
    for (let i = 0; i < this.dom.players.length; i++) {
      // update toy images
      this.dom.toyImages[i].src = `img/toys/${toyType.key}/full.svg`
      // reset scores
      this.dom.score[i].innerHTML = toysCapacity
    }
  }

  updateScore(id, score) {
    // update score
    const domScore = this.elem.querySelector(`.toys-board__player--${id} [data-toys-board-score]`)
    domScore.innerHTML = score
  }

  reset(id, score) {
    this.updateScore(id, score)
  }
}


app.ToysBoard = new ToysBoard()