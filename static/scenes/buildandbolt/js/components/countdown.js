goog.provide('app.Countdown')

goog.require('Constants')

goog.require('app.Walkthrough')

class Countdown {
  init(game, elem) {
    this.elem = elem
    this.game = game

    this.dom = {
      numbers: this.elem.querySelectorAll('[data-countdown-numbers]'),
      go: this.elem.querySelector('[data-countdown-go]')
    }
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
          // resume game
          this.game.canResume = true;
          this.game.resume()
          // hide walkthrough
          app.Walkthrough.hide()
        }, start + second + 1500)
      }
    }
  }
}

app.Countdown = new Countdown()