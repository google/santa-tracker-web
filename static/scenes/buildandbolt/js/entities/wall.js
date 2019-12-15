goog.provide('app.Wall');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.shared.pools');

app.Wall = class Wall extends app.Entity {
  constructor() {
    super();

    this.lastSoundTime = 0;
  }

  onInit(config) {
    super.onInit({...config, checkBorder: true});

    // Assumes a min size of 2 x 4
    const tileDim = 1;
    const lastRowHeight = 3;
    for (let j = 0; j < config.height - lastRowHeight; j += tileDim) {
      for (let i = 0; i < config.width; i += tileDim) {
        let position;

        if (i == 0 && j == 0) {
          position = 'top-left';
        } else if (i == config.width - tileDim && j == 0) {
          position = 'top-right';
        } else if (i == config.width - tileDim && j == 0) {
          position = 'top-right';
        } else if (i == 0) {
          position = 'middle-left';
        } else if (i == config.width - tileDim) {
          position = 'middle-right';
        } else if (j == 0) {
          position = 'top-middle';
        }

        this.addTile(position);
      }
    }

    // construct last row
    this.addTile('bottom-left');
    for (let i = tileDim; i < config.width - tileDim; i += tileDim) {
      this.addTile('bottom-middle');
    }
    this.addTile('bottom-right');
  }

  onDispose() {
    super.onDispose();
    Utils.removeAllChildren(this.elem);
  }

  addTile(position) {
    let tile = document.createElement('div');
    tile.classList.add('wall__tile');

    if (position) {
      tile.classList.add(`wall__tile--${position}`);
    }

    this.elem.appendChild(tile);
  }

  render() {
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    let actions = [];

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition);

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK];
      this.playSound();
    }

    return actions;
  }

  playSound() {
    if (performance.now() - this.lastSoundTime > 1500) {
      window.santaApp.fire('sound-trigger', 'buildandboilt_wallstop');
      this.lastSoundTime = performance.now();
    }
  }
}

app.Wall.targetHolderId = 'walls';
app.Wall.elemClass = 'wall';

app.shared.pools.mixin(app.Wall);
