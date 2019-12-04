goog.provide('app.Wall')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools')
goog.require('Utils')

app.Wall = class Wall extends app.Entity {
  constructor() {
    super()
    this.lastSoundTime = 0;
    this.elem = document.createElement('div')
    document.getElementById('walls').append(this.elem)
    this.elem.setAttribute('class', 'wall')
  }

  onInit(config) {
    super.onInit(config)
    this.config.checkBorder = true
  }

  render() {
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK]
      this.playSound();
    }

    return actions
  }

  playSound() {
    if (performance.now() - this.lastSoundTime > 1500) {
      window.santaApp.fire('sound-trigger', 'buildandboilt_wallstop');
      this.lastSoundTime = performance.now();
    }
  }
}

app.shared.pools.mixin(app.Wall);
