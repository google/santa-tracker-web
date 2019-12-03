goog.provide('app.Gui')

goog.require('app.shared.utils')
goog.require('Constants')

app.Gui = class Gui {
  constructor(game) {
    this.game = game
    this.guiElem = this.game.context.querySelector('[data-gui]')
    this.playerSelectionScreen = this.game.context.querySelector('[data-player-selection]')
    this.playerSelectionOptions = this.game.context.querySelectorAll('[data-player-option]')
    this.controlsScreen = this.game.context.querySelector('[data-player-controls]')
    this.controlsButton = this.game.context.querySelector('[data-player-controls-skip]')

    if (app.shared.utils.touchEnabled) {
      this.playerOption = Constants.PLAYER_OPTIONS.SINGLE
      this.controlsScreen.classList.remove('is-hidden')
    } else {
      this.playerSelectionScreen.classList.remove('is-hidden')
      this.playerSelectionOptions.forEach((element) => {
          element.addEventListener('click',
              this.onPlayerOptionClick.bind(this, element))
      })
    }

    this.controlsButton.addEventListener('click',
        this.onSkipControlsClick.bind(this))
  }

  onPlayerOptionClick(element) {
    this.playerSelectionScreen.classList.add('is-hidden')
    this.controlsScreen.classList.remove('is-hidden')
    this.playerOption = element.getAttribute('data-player-option')
  }

  onSkipControlsClick() {
    this.game.init(this.playerOption)
    this.controlsScreen.classList.add('is-hidden')
    this.guiElem.classList.add('game-started')
  }
}