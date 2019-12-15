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

    const tileDim = .5;
    for (let j = 0; j < config.height; j += tileDim) {
      for (let i = 0; i < config.width; i += tileDim) {
        let tile = document.createElement('div');
        tile.classList.add('platform__tile');

        if (i == 0 && j == 0) {
          tile.classList.add('platform__tile--top-left');
        } else if (i == config.width - tileDim && j == 0) {
          tile.classList.add('platform__tile--top-right');
        } else if (i == 0 && j == config.height - tileDim) {
          tile.classList.add('platform__tile--bottom-left');
        } else if (i == config.width - tileDim &&
            j == config.height - tileDim) {
          tile.classList.add('platform__tile--bottom-right');
        } else if (i == 0) {
          tile.classList.add('platform__tile--middle-left');
        } else if (i == config.width - tileDim) {
          tile.classList.add('platform__tile--middle-right');
        } else if (j == config.height - tileDim) {
          tile.classList.add('platform__tile--bottom-middle');
        }

        this.elem.appendChild(tile);
      }
    }

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
