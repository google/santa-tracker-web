goog.provide('app.PresentBox');

goog.require('Constants');
goog.require('Utils');

goog.require('app.ControlsManager');
goog.require('app.Entity');
goog.require('app.LevelManager');
goog.require('app.shared.pools');

app.PresentBox = class PresentBox extends app.Entity {
  onInit(config) {
    config.width = Constants.PRESENT_WIDTH;
    config.height = Constants.PRESENT_HEIGHT;

    super.onInit(config);
    this.config.checkBorder = true;

    // reset to base present box styles
    this.elem.setAttribute('class', 'present-box');

    this.elem.classList.add(`present-box--${this.config.playerId}`);

    let options = this.config.isMiddle ? 2 : 3;
    const option = Math.floor(Math.random() * options) + 1;
    if (this.config.isSideView && this.config.isMiddle) {
      this.elem.classList.add(`present-box--middle`);
      this.elem.classList.add(`present-box--middle-${option}`);
    } else if (this.config.isSideView && !this.config.isMiddle) {
      this.elem.classList.add(`present-box--bottom`);
      this.elem.classList.add(`present-box--bottom-${option}`);
    } else {
      this.elem.classList.add(`present-box--front`);
      this.elem.classList.add(`present-box--front-${option}`);
    }
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    let actions = [];
    let toyCompleted = player.id == this.config.playerId;

    if (toyCompleted) {
      // check if all parts are here
      const { toyType } = app.LevelManager;
      for (let i = 1; i <= toyType.size; i++) {
        if (player.toyParts.indexOf(i) == -1) {
          toyCompleted = false;
        }
      }
    }

    // if player is close to border, it can do an action
    if (toyCompleted && Utils.isTouchingBorder(this.config, player.position)) {
      if (app.ControlsManager.isTouch || app.ControlsManager.isKeyControlActive(player.controls.action)) {
        if (!this.toyAccepted) {
          actions = [Constants.PLAYER_ACTIONS.ACCEPT_TOY];
          this.toyAccepted = true;
          this.elem.classList.add('present-box--closed');
        }
      }
      if (Constants.DEBUG) {
        this.elem.style.opacity = 0.5;
      }
    } else if (Constants.DEBUG) {
      this.elem.style.opacity = 1;
    }

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition);

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK];
    }

    return actions;
  }

  onDispose() {
    super.onDispose();

    this.toyAccepted = false; // reopen box
  }
}

app.PresentBox.targetHolderId = 'present-boxes';
app.PresentBox.elemClass = 'present-box';

app.shared.pools.mixin(app.PresentBox);

