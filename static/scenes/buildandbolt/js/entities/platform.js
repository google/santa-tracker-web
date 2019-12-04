goog.provide('app.Platform')

goog.require('Constants')

goog.require('app.Slider')
goog.require('app.shared.pools');
goog.require('Utils')

app.Platform = class Platform extends app.Slider {
  constructor() {
    super()

    document.getElementById('platforms').append(this.elem)
    this.elem.setAttribute('class', 'platform')
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM]
  }
}

app.shared.pools.mixin(app.Platform)
