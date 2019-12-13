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

    const cellDim = .5;
    for (let j = 0; j < config.height; j += cellDim) {
      for (let i = 0; i < config.width; i += cellDim) {
        let cell = document.createElement('div');
        cell.classList.add('platform__tile');

        if (i == 0 && j == 0) {
          cell.classList.add('platform__tile--top-left');
        } else if (i == config.width - cellDim && j == 0) {
          cell.classList.add('platform__tile--top-right');
        } else if (i == config.width - cellDim && j == 0) {
          cell.classList.add('platform__tile--top-right');
        } else if (i == 0 && j == config.height - cellDim) {
          cell.classList.add('platform__tile--bottom-left');
        } else if (i == config.width - cellDim &&
            j == config.height - cellDim) {
          cell.classList.add('platform__tile--bottom-right');
        } else if (i == 0) {
          cell.classList.add('platform__tile--middle-left');
        } else if (i == config.width - cellDim) {
          cell.classList.add('platform__tile--middle-right');
        } else if (j == config.height - cellDim) {
          cell.classList.add('platform__tile--bottom-middle');
        }

        this.elem.appendChild(cell);
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
