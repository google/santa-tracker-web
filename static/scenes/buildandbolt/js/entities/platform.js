goog.provide('app.Platform')

goog.require('Constants')

goog.require('app.Slider')
goog.require('Utils')

app.Platform = class Platform extends app.Slider {
  constructor(game, config) {
    super(game, config)

    document.getElementById('platforms').append(this.elem)
    this.elem.setAttribute('class', 'platform')

    this.init()
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
  }
}