goog.provide('app.ToysBoard')

goog.require('app.ScoreManager')

class ToysBoard {
  init(elem, players) {
    this.elem = elem
    this.players = {}

    this.ui = {
      players: this.elem.querySelectorAll('.toys-board__player'),
      toyImages: this.elem.querySelectorAll('.toys-board__toy-img'),
      numbers: this.elem.querySelectorAll('.toys-board__number'),
    }

    this.initPlayers(players)
  }

  initPlayers(players) {
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      this.players[player.id] = {
        score: 0,
        index: i,
      }
    }

    if (players.length === 1) {
      this.ui.players[1].remove()
      this.elem.classList.add('single-player')
    }
  }

  initLevel(toyType) {
    const keys = Object.keys(this.players)
    for (const key of keys) {
      const player = this.players[key]
      // reset scores to 0
      player.score = 0
      this.ui.numbers[player.index].innerHTML = player.score

      // update toy images
      this.ui.toyImages[player.index].src = `img/toys/${toyType}/full.svg`
    }
  }

  score(id) {
    const player = this.players[id]
    player.score++

    this.ui.numbers[player.index].innerHTML = player.score
  }
}


app.ToysBoard = new ToysBoard()