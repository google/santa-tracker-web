goog.provide('app.Countdown')

goog.require('Constants')

class Countdown {
  init(game, elem) {
    this.elem = elem
    this.game = game

    this.dom = {
      numbers: this.elem.querySelectorAll('[data-countdown-number]'),
    }
  }

  show() {
    this.game.pause()
    this.elem.classList.remove('is-hidden')
    // To do: start countdown

    setTimeout(() => {
      // unfreeze game
      this.game.resume()
      this.hide()
    }, 3000)
  }

  hide() {
    this.elem.classList.add('is-hidden')
  }

  start() {
    // animate

  }
}

app.Countdown = new Countdown()