goog.provide('app.Pit')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools');
goog.require('Utils')

app.Pit = class Pit extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('pits').append(this.elem)
    this.elem.setAttribute('class', 'pit')
  }

  render() {
    super.render()
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.RESTART]
  }
}

app.shared.pools.mixin(app.Pit)
