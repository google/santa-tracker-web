goog.provide('app.Wall');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.TileManager');
goog.require('app.shared.pools');

app.Wall = class Wall extends app.Entity {
  constructor() {
    super();

    this.lastSoundTime = 0;
  }

  onInit(config) {
    super.onInit({...config, checkBorder: true});
    app.TileManager.renderEntity('wall', config.width, config.height,
        this.elem);
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
