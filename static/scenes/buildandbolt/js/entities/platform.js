goog.provide('app.Platform');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Slider');
goog.require('app.TileManager');
goog.require('app.shared.pools');

app.Platform = class Platform extends app.Slider {
  onContact(player) {
    super.onContact(player);
    return [Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM];
  }

  onInit(config) {
    super.onInit(config);

    app.TileManager.renderEntity('platform', config.width, config.height,
        this.elem);

    super.render(); // render once
  }

  onDispose() {
    super.onDispose();
    Utils.removeAllChildren(this.elem);
  }
}

app.Platform.targetHolderId = 'platforms';
app.Platform.elemClass = 'platform';

app.shared.pools.mixin(app.Platform);
