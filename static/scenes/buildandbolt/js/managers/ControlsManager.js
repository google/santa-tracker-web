goog.provide('app.ControlsManager')

goog.require('app.shared.utils')
goog.require('app.Board')
goog.require('Utils')

/**
 * Handles user input for controlling the game.
 * @param {Game} game The game object.
 *
 * @constructor
 */
class ControlsManager {
  init(game, boardBkg) {
    this.tutorial_ = game.tutorial

    if (app.shared.utils.touchEnabled) {
      this.isTouch = true
      this.currentTouchId = null
      boardBkg.addEventListener(
          'touchstart',
          this.onTouchStart.bind(this))
      boardBkg.addEventListener(
          'touchmove',
          this.onTouchMove.bind(this))
      boardBkg.addEventListener(
          'touchend',
          this.onTouchEnd.bind(this))
    } else {
      this.trackedKeys = {}

      window.addEventListener('keydown', this.onKeyDown.bind(this))
      window.addEventListener('keyup', this.onKeyUp.bind(this))
    }
  }

  /**
   * Handles the key down event. Called dynamically.
   * @param  {Event} e The event object.
   */
  onKeyDown(e) {
    this.trackedKeys[e.code] = true
  }

  /**
   * Handles the key up event. Called dynamically.
   * @param  {Event} e The event object.
   * @this {ControlsManager} The ControlsManager object.
   */
  onKeyUp(e) {
    this.trackedKeys[e.code] = false
  }

  /**
   * @param  {[type]}  keys List of keys to check for
   * @return {Boolean} true if any of the given keys are pressed
   */
  isKeyControlActive(keys) {
    for (const key of keys) {
      if (this.trackedKeys[key]) {
        return true
      }
    }

    return false
  }

  onTouchStart(e) {
    var touch = e.changedTouches[0]


    this.currentTouchId = touch.identifier
    this.currentTouchPosition = Utils.pixelToGridPosition(app.Board.context,
        { x: touch.clientX, y: touch.clientY })

    e.preventDefault()

    // Let tutorial know about touch so it can hide the tutorial.
    if (!this.touchStarted) {
      this.tutorial_.off('buildandbolt_mobile.mp4');
      this.touchStarted = true;
    }
  }

  onTouchMove(e) {
    var touch = this.getCurrentTouch(e)
    if (!touch) {
      return
    }

    this.currentTouchPosition = Utils.pixelToGridPosition(app.Board.context,
        { x: touch.clientX, y: touch.clientY })

    e.preventDefault()
  }

  onTouchEnd(e) {
    var touch = this.getCurrentTouch(e)
    if (!touch) {
      return
    }

    this.currentTouchId = null
    this.currentTouchPosition = null
    e.preventDefault()
  }

  getCurrentTouch(e) {
    if (this.currentTouchId === null) {
      return
    }

    for (let i = 0, touch; touch = e.changedTouches[i]; i++) {
      if (touch.identifier === this.currentTouchId) {
        return touch
      }
    }
  }

  /**
   * Returns a magnitude of movement for each direction
   */
  getMovementDirections(controls, currentPosition) {
    if (this.isTouch) {
      if (this.currentTouchPosition &&
          Utils.getDistance(this.currentTouchPosition, currentPosition) > 0.1) {
        const angle = Utils.getAngle(this.currentTouchPosition, currentPosition)
        let magnitudeX = Math.abs(Math.cos(angle))
        let magnitudeY = Math.abs(Math.sin(angle))

        // normalize magnitudes - should add up to 1
        magnitudeX = magnitudeX / (magnitudeX + magnitudeY)
        magnitudeY = magnitudeY / (magnitudeX + magnitudeY)

        return {
          left: this.currentTouchPosition.x < currentPosition.x ? magnitudeX : 0,
          right: this.currentTouchPosition.x > currentPosition.x ? magnitudeX : 0,
          up: this.currentTouchPosition.y < currentPosition.y ? magnitudeY : 0,
          down: this.currentTouchPosition.y > currentPosition.y ? magnitudeY : 0
        }
      } else {
        return {
          left: 0,
          right: 0,
          up: 0,
          down: 0
        }
      }
    } else {
      const keys = {
          left: this.isKeyControlActive(controls.left),
          right: this.isKeyControlActive(controls.right),
          up: this.isKeyControlActive(controls.up),
          down: this.isKeyControlActive(controls.down)
        }

      let totalKeys = 0
      for (const direction in keys) {
        if (keys[direction]) {
          totalKeys++
        }
      }

      const magnitude = 1 / totalKeys

      return {
        left: keys.left ? magnitude : 0,
        right: keys.right ? magnitude : 0,
        up: keys.up ? magnitude : 0,
        down: keys.down ? magnitude : 0
      }
    }
  }
}

app.ControlsManager = new ControlsManager()

