goog.provide('app.ControlsManager');

goog.require('app.shared.utils');
goog.require('app.Board');
goog.require('Utils');

/**
 * Handles user input for controlling the game.
 * @param {Game} game The game object.
 *
 * @constructor
 */
class ControlsManager {
  init(game, boardBkg) {
    this.tutorial_ = game.tutorial;

    if (app.shared.utils.touchEnabled) {
      this.isTouch = true;
      this.currentTouchId = null;
      boardBkg.addEventListener(
          'touchstart',
          this.onTouchStart.bind(this));
      boardBkg.addEventListener(
          'touchend',
          this.onTouchEnd.bind(this));
    } else {
      this.trackedKeys = {};

      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
  }

  /**
   * Handles the key down event. Called dynamically.
   * @param  {Event} e The event object.
   */
  onKeyDown(e) {
    this.trackedKeys[e.code] = true;
  }

  /**
   * Handles the key up event. Called dynamically.
   * @param  {Event} e The event object.
   * @this {ControlsManager} The ControlsManager object.
   */
  onKeyUp(e) {
    this.trackedKeys[e.code] = false;
  }

  /**
   * @param  {[type]}  keys List of keys to check for
   * @return {Boolean} true if any of the given keys are pressed
   */
  isKeyControlActive(keys) {
    for (const key of keys) {
      if (this.trackedKeys[key]) {
        return true;
      }
    }

    return false;
  }

  onTouchStart(e) {
    var touch = e.changedTouches[0];

    this.currentTouchId = touch.identifier
  }

  onTouchEnd(e) {
    var touch = this.getCurrentTouch(e);
    if (!touch) {
      return;
    }

    this.currentTouchId = touch.identifier
    this.currentTouchPosition = Utils.pixelToGridPosition(app.Board.context,
        { x: touch.clientX, y: touch.clientY }, true);

    // e.preventDefault();

    // Let tutorial know about touch so it can hide the tutorial.
    if (!this.touchStarted) {
      this.tutorial_.off('buildandbolt_mobile.mp4');
      this.touchStarted = true;
    }
  }

  getCurrentTouch(e) {
    if (this.currentTouchId === null) {
      return;
    }

    for (let i = 0, touch; touch = e.changedTouches[i]; i++) {
      if (touch.identifier === this.currentTouchId) {
        return touch;
      }
    }
  }

  /**
   * Returns a magnitude of movement for each direction
   */
  getMovementDirections(controls, currentPosition, platform, platformOffset) {
    if (this.isTouch) {
      if (this.currentTouchPosition) {
        let goalPosition = this.currentTouchPosition;
        let startPosition = currentPosition;

        if (platform && platformOffset) {
          goalPosition =  {
            x: this.currentTouchPosition.x - platform.position.x,
            y: this.currentTouchPosition.y - platform.position.y
          };

          startPosition = platformOffset;
        }

        const distance = Utils.getDistance(goalPosition, startPosition);
        if (distance > .2) {
          // Slows player down as it gets close to the goal point
          const magnitudeMultiplier = Math.pow(Math.min(1, distance / 3), 2);
          const angle = Utils.getAngle(goalPosition, startPosition);
          const magnitudeX = Math.abs(Math.cos(angle)) * magnitudeMultiplier;
          const magnitudeY = Math.abs(Math.sin(angle)) * magnitudeMultiplier;

          return {
            left: goalPosition.x < startPosition.x ? magnitudeX : 0,
            right: goalPosition.x > startPosition.x ? magnitudeX : 0,
            up: goalPosition.y < startPosition.y ? magnitudeY : 0,
            down: goalPosition.y > startPosition.y ? magnitudeY : 0
          };
        }

        // If no more movement needed, clear touch position
        this.clearPosition();
      }

      return {
        left: 0,
        right: 0,
        up: 0,
        down: 0
      };
    }

    const keys = {
        left: this.isKeyControlActive(controls.left),
        right: this.isKeyControlActive(controls.right),
        up: this.isKeyControlActive(controls.up),
        down: this.isKeyControlActive(controls.down)
      };

    let totalKeys = 0;
    for (const direction in keys) {
      if (keys[direction]) {
        totalKeys++;
      }
    }

    const magnitude = 1 / totalKeys;

    return {
      left: keys.left ? magnitude : 0,
      right: keys.right ? magnitude : 0,
      up: keys.up ? magnitude : 0,
      down: keys.down ? magnitude : 0
    };
  }

  /**
   * Forget last goal position
   */
  clearPosition() {
    this.currentTouchId = null;
    this.currentTouchPosition = null;
  }
}

app.ControlsManager = new ControlsManager();

