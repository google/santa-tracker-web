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
      this.startGame()
      return
    } else {
      this.playerSelectionScreen.classList.remove('is-hidden')
      this.playerSelectionOptions.forEach((element) => {
          element.addEventListener('click',
              this.onPlayerOptionClick.bind(this, element))

          element.addEventListener('mouseenter', this.onPlayerOptionOver.bind(this, element))
      })
    }

    this.controlsButton.addEventListener('click',
        this.onSkipControlsClick.bind(this))
    this.controlsButton.addEventListener('mouseenter',
        this.onSkipControlsOver.bind(this))

    // Debug mode
    // this.onPlayerOptionClick(this.playerSelectionOptions[1])
    // this.onSkipControlsClick()
    // end debug mode
  }

  onPlayerOptionClick(element) {
    this.playerSelectionScreen.classList.add('is-hidden')
    this.playerOption = element.getAttribute('data-player-option')
    this.controlsScreen.classList.remove('is-hidden')
    this.controlsScreen.setAttribute('data-player-controls', this.playerOption)
    window.santaApp.fire('sound-trigger', 'generic_button_click')
  }

  onPlayerOptionOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over')
  }

  onSkipControlsClick() {
    this.controlsScreen.classList.add('is-hidden')
    this.startGame()
    window.santaApp.fire('sound-trigger', 'generic_button_click')
  }

  onSkipControlsOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over')
  }

  startGame() {
    this.game.init(this.playerOption)
    this.guiElem.classList.add('game-started')
  }
}