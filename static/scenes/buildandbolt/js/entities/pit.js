goog.provide('app.Pit');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.shared.pools');

app.Pit = class Pit extends app.Entity {
  onInit(config) {
    super.onInit({...config, checkCell: true});
  }

  render() {
    super.render();
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    const offset = {
      top: 0,
      bottom: 1,
      left: 1,
      right: 1
    };

    const position = Utils.isFallingInPit(this.config, player.position, offset)

    if (position.inside) {
      if (position.isAbovePit) {
        player.position.y++
        player.prevPosition.y++
      }
      return [Constants.PLAYER_ACTIONS.PIT_FALL];
    }

    return []
  }
}

app.Pit.targetHolderId = 'pits';
app.Pit.elemClass = 'pit';

app.shared.pools.mixin(app.Pit);
