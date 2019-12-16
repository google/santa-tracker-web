goog.provide('app.Pit');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.TileManager');
goog.require('app.shared.pools');

app.Pit = class Pit extends app.Entity {
  onInit(config) {
    super.onInit({...config, checkCell: true});

    app.TileManager.renderEntity('pit', config.width, config.height,
        this.elem);
  }

  onDispose() {
    super.onDispose();
    Utils.removeAllChildren(this.elem);
  }

  addTile(position) {
    let tile = document.createElement('div');
    tile.classList.add('pit__tile');

    if (position) {
      tile.classList.add(`pit__tile--${position}`);
    }

    this.elem.appendChild(tile);
  }

  render() {
    super.render();
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    if (Utils.isTouchingBorder(this.config, player.position)) {
      return [Constants.PLAYER_ACTIONS.PIT_FALL];
    }

    return [];
  }
}

app.Pit.targetHolderId = 'pits';
app.Pit.elemClass = 'pit';

app.shared.pools.mixin(app.Pit);
