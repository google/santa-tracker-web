goog.provide('app.Pit');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.shared.pools');

app.Pit = class Pit extends app.Entity {
  constructor() {
    super();

    this.elem = document.createElement('div');
    document.getElementById('pits').append(this.elem);
    this.elem.setAttribute('class', 'pit');
  }

  onInit(config) {
    super.onInit(config);
    this.config.checkCell = true;
  }

  render() {
    super.render();
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    super.onContact(player);
    return [Constants.PLAYER_ACTIONS.PIT_FALL];
  }
}

app.shared.pools.mixin(app.Pit);
