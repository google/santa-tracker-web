goog.provide('app.Controls')

goog.require('app.shared.utils')
goog.require('app.Board')
goog.require('Utils')

/**
 * Handles user input for controlling the game.
 * @param {Game} game The game object.
 *
 * @constructor
 */
class Controls {
  init(game) {
    // this.players_ = game.players
    // this.tutorial_ = game.tutorial

    if (app.shared.utils.touchEnabled) {
      this.isTouch = true
      this.currentTouchId = null
      game.context.addEventListener(
          'touchstart',
          this.onTouchStart.bind(this))
      game.context.addEventListener(
          'touchmove',
          this.onTouchMove.bind(this))
      game.context.addEventListener(
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

    // if (!this.arrowPressed && (e.keyCode === 38 || e.keyCode === 40)) {
    //   // Let tutorial know if arrow has been pressed
    //   // and hide tutorial when user presses the button
    //   this.tutorial_.off('keys-updown')
    //   this.arrowPressed = true
    // }
  }

  /**
   * Handles the key up event. Called dynamically.
   * @param  {Event} e The event object.
   * @this {Controls} The Controls object.
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
    // if (!this.touchStarted) {
    //   this.tutorial_.off('touch-updown');
    //   this.touchStarted = true;
    // }
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

  getMovementDirections(controls, currentPosition) {
    if (this.isTouch) {
      if (this.currentTouchPosition) {
        return {
          left: this.currentTouchPosition.x < currentPosition.x,
          right: this.currentTouchPosition.x > currentPosition.x,
          up: this.currentTouchPosition.y < currentPosition.y,
          down: this.currentTouchPosition.y > currentPosition.y
        }
      } else {
        return {
          left: false,
          right: false,
          up: false,
          down: false
        }
      }
    } else {
      return {
        left: this.isKeyControlActive(controls.left),
        right: this.isKeyControlActive(controls.right),
        up: this.isKeyControlActive(controls.up),
        down: this.isKeyControlActive(controls.down)
      }
    }
  }
}

app.Controls = new Controls()

