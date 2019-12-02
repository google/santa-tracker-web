goog.provide('app.Controls')

goog.require('app.shared.utils')

/**
 * Handles user input for controlling the game.
 * @param {Game} game The game object.
 *
 * @constructor
 */
app.Controls = class Controls {
  constructor(game) {
    this.game_ = game
    this.players_ = game.players
    // this.tutorial_ = game.tutorial

    if (app.shared.utils.touchEnabled) {
      this.currentTouchId = null
      this.game_.context.addEventListener(
          'touchstart',
          this.onTouchStart.bind(this))
      this.game_.context.addEventListener(
          'touchmove',
          this.onTouchMove.bind(this))
      this.game_.context.addEventListener(
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
    var touch = e.originalEvent.changedTouches[0]

    this.currentTouchId = touch.identifier
    this.currentTouchPosition = {
      x: touch.clientX,
      y: touch.clientY
    }
    e.preventDefault()

    // Let tutorial know about touch so it can hide the tutorial.
    // if (!this.touchStarted) {
    //   this.tutorial_.off('touch-updown');
    //   this.touchStarted = true;
    // }
  }

  onTouchMove(e) {
    var touch = this.getCurrentTouch(e.originalEvent)
    if (!touch) {
      return
    }

    this.currentTouchPosition = {
      x: touch.clientX,
      y: touch.clientY
    }
    e.preventDefault()
  }

  onTouchEnd(e) {
    var touch = this.getCurrentTouch(e.originalEvent)
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
}

