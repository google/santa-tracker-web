goog.provide('app.Ice')

goog.require('Constants')
goog.require('Utils')

goog.require('app.Entity')
goog.require('app.shared.pools')

app.Ice = class Ice extends app.Entity {
  onInit(config) {
    super.onInit(config)
    this.config.checkCell = true
  }

  render() {
    super.render()
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.ICE]
  }
}

app.Ice.targetHolderId = 'ice';
app.Ice.elemClass = 'ice';

app.shared.pools.mixin(app.Ice)
