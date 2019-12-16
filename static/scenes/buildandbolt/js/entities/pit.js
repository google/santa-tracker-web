goog.provide('app.Pit');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.TileManager');
goog.require('app.shared.pools');

app.Pit = class Pit extends app.Entity {
  onInit(config) {
    super.onInit({...config, checkCell: true});

    // Assumes a min size of 3 x 3
    const tileDim = 1;
    const firstRowHeight = 2;

    // construct first row
    this.addTile('top-left');
    for (let i = tileDim; i < config.width - tileDim; i += tileDim) {
      this.addTile('top-middle');
    }
    this.addTile('top-right');

    for (let j = firstRowHeight; j < config.height; j += tileDim) {
      for (let i = 0; i < config.width; i += tileDim) {
        let position;

        if (config.height > 3 && j == firstRowHeight && i == 0) {
          position = 'middle-1-left';
        } else if (config.height > 3 && j == firstRowHeight &&
            i == config.width - tileDim) {
          position = 'middle-1-right';
        } else if (i == 0 && j == config.height - tileDim) {
          position = 'bottom-left';
        } else if (i == config.width - tileDim &&
            j == config.height - tileDim) {
          position = 'bottom-right';
        } else if (i == 0) {
          position = 'middle-left';
        } else if (i == config.width - tileDim) {
          position = 'middle-right';
        } else if (j == config.height - tileDim) {
          position = 'bottom-middle';
        }

        this.addTile(position);
      }
    }
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
