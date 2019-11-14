goog.provide('app.Penguin')

goog.require('Constants')

goog.require('app.Slider')
goog.require('app.shared.pools');
goog.require('Utils')

app.Penguin = class Penguin extends app.Slider {
  constructor(game, config) {
    super(game, config)

    document.getElementById('penguins').append(this.elem)
    this.elem.setAttribute('class', 'penguin')

    this.init()
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.RESTART]
  }
}
