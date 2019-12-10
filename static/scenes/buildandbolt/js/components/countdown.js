goog.provide('app.Countdown')

goog.require('Constants')

class Countdown {
  init(game, elem) {
    this.elem = elem
    this.game = game

    this.dom = {
      numbers: this.elem.querySelectorAll('[data-countdown-numbers]'),
    }

    setTimeout(() => {
      this.start()
    }, Constants.LEVEL_TRANSITION_TIMING)
  }

  show() {
    this.game.pause()
    this.elem.classList.remove('is-hidden')
    // To do: start countdown
  }

  hide() {
    this.elem.classList.add('is-hidden')
  }

  start() {
    // animate
    for (let i = 0; i < this.dom.numbers.length; i++) {
      setTimeout(() => {
        this.dom.numbers[i].classList.add('animate')
      }, i * 1000)
    }

  }
}

app.Countdown = new Countdown()