goog.provide('app.ScoreScreen')

goog.require('Constants')

goog.require('app.shared.utils')

class ScoreScreen {
  init(game, elem, playerOption) {
    this.game = game
    this.elem = elem

    this.dom = {
      skipButton: this.elem.querySelector('[data-score-screen-skip]'),
      players: this.elem.querySelectorAll('[data-score-screen-player]'),
    }

    // if single player
    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.dom.players[1].remove()
      this.elem.classList.add('single-player')
      // put winning image
      const domCharacter = this.dom.players[0].querySelector(`[data-score-screen-character]`)
      domCharacter.src = `img/players/a/win.svg`
    }

    this.dom.skipButton.addEventListener('click', this.onSkipControlsClick.bind(this))
    this.dom.skipButton.addEventListener('mouseenter', this.onSkipControlsOver.bind(this))
  }

  show() {
    this.elem.classList.remove('is-hidden')
    this.state = 'show'
  }

  showEnd(scoreResult, multiplayer) {
    // show end score screen
    this.show()
    this.elem.classList.add('game-end')

    if (multiplayer) {
      const { playersState, tie } = scoreResult
      if (tie) {
        this.elem.classList.add('tie')
      } else {
        // Set right class to right player
        for (let i = 0; i < playersState.length; i++) {
          const { id, state } = playersState[i]
          const domPlayer = this.elem.querySelector(`.score-screen__player--${id}`)
          domPlayer.classList.add(state)
        }
      }
    } else {
      this.dom.players[0].classList.add('win')
    }
  }

  hide() {
    this.elem.classList.add('is-hidden')
    setTimeout(() => {
      this.state = 'hidden'
    }, 1000) // temporary prevent bug, game.gameover() is called twice after countdown is === 0
  }

  updateScore(id, score, toy) {
    // update score
    const domScore = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-score]`)
    domScore.innerHTML = score

    // add toy image
    const domToys = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-toys]`)
    const img = document.createElement('img')
    img.classList.add('score-screen__toy')
    img.src = `img/toys/${toy}/full.svg`
    domToys.appendChild(img)
  }

  updateCharacters(playersState) {
    for (let i = 0; i < playersState.length; i++) {
      const { id, state } = playersState[i]
      const domCharacter = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-character]`)
      domCharacter.src = `img/players/${id}/${state}.svg`
    }
  }

  onSkipControlsClick() {
    this.hide()
    window.santaApp.fire('sound-trigger', 'generic_button_click')
    this.game.goToNextLevel()
  }

  onSkipControlsOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  }

  reset(id, score) {
    const domScore = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-score]`)
    domScore.innerHTML = score

    // add toy image
    const domToys = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-toys]`)
    domToys.innerHTML = ''
  }
}


app.ScoreScreen = new ScoreScreen()