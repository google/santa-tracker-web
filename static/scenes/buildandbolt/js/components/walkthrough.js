goog.provide('app.Walkthrough')

goog.require('Constants')

goog.require('app.LevelManager')

class Walkthrough {
  init(game, elem) {
    this.elem = elem
    this.game = game

    this.dom = {
      text: this.elem.querySelector('[data-walkthrough-text]'),
      toys: this.elem.querySelector('[data-walkthrough-toys]')
    }

    this.updateLevelAndShow()
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

  updateLevelAndShow() {
    const { toyType } = app.LevelManager
    // update text
    const currentText = this.elem.querySelector(`[data-walkthrough-text-hidden="${toyType.key}"]`).innerHTML
    this.dom.text.innerHTML = currentText

    // update toys
    this.dom.toys.innerHTML = ''

    for (let i = 0; i < toyType.size; i++) {
      const domToypart = document.createElement('div')
      domToypart.classList.add('walkthrough__toypart')
      domToypart.classList.add('walkthrough__appear')

      const img = document.createElement('img')
      img.classList.add('walkthrough__toypart-img')
      img.src = `img/toys/${toyType.key}/${i + 1}.svg`

      const domOperator = document.createElement('div')
      domOperator.classList.add('walkthrough__operator')
      domOperator.classList.add('walkthrough__appear')
      domOperator.innerHTML = i === toyType.size - 1 ? '=' : '+'

      domToypart.appendChild(img)

      this.dom.toys.appendChild(domToypart)
      this.dom.toys.appendChild(domOperator)
    }

    const domToyfull = document.createElement('div')
    domToyfull.classList.add('walkthrough__toyfull')
    domToyfull.classList.add('walkthrough__appear')

    const img = document.createElement('img')
    img.classList.add('walkthrough__toyfull-img')
    img.src = `img/toys/${toyType.key}/full.svg`

    domToyfull.appendChild(img)

    this.dom.toys.appendChild(domToyfull)

    // wait level transition before showing the walkthrough
    setTimeout(() => {
      this.show()
    }, Constants.LEVEL_TRANSITION_TIMING)
  }
}

app.Walkthrough = new Walkthrough()