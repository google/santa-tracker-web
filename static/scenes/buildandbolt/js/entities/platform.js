goog.provide('app.Platform');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Slider');
goog.require('app.shared.pools');

app.Platform = class Platform extends app.Slider {
  onContact(player) {
    super.onContact(player);
    return [Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM];
  }

  onInit(config) {
    super.onInit(config);
    super.render(); // render once
  }
}

app.Platform.targetHolderId = 'platforms';
app.Platform.elemClass = 'platform';

app.shared.pools.mixin(app.Platform);
