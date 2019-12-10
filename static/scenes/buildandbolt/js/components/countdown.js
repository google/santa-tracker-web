goog.provide('app.Countdown')

goog.require('Constants')

class Countdown {
  init(game, elem) {
    this.elem = elem
    this.game = game

    this.dom = {
      numbers: this.elem.querySelectorAll('[data-countdown-numbers]'),
      go: this.elem.querySelector('[data-countdown-go]')
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
    const second = 1000
    // animate
    for (let i = 0; i < this.dom.numbers.length; i++) {
      const start = i * second
      setTimeout(() => {
        this.dom.numbers[i].classList.add('animate')
      }, start)

      setTimeout(() => {
        this.dom.numbers[i].classList.remove('animate')
      }, start + second)

      if (i === this.dom.numbers.length - 1) {
        setTimeout(() => {
          this.dom.go.classList.add('animate')
        }, start + second + 200)

        setTimeout(() => {
          this.dom.go.classList.remove('animate')
        }, start + second + 1500)
      }
    }
  }
}

app.Countdown = new Countdown()