goog.provide('app.Controls')

// goog.require('Constants')

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

    // this.currentTouchId = null
    // this.currentTouchStartY = null

    this.trackedKeys = {}

    // this.game_.context.addEventListener(
    //     'touchstart',
    //     handler)
    // this.game_.context.addEventListener(
    //     'touchmove',
    //     handler)
    // this.game_.context.addEventListener(
    //     'touchend',
    //     handler)
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  /**
   * Handles the key down event. Called dynamically.
   * @param  {Event} e The event object.
   */
  onKeyDown(e) {
    this.trackedKeys[e.key] = true

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
    this.trackedKeys[e.key] = false
  }
}

// /**
//  * Touch controls
//  */
// app.Controls.prototype.touchStartedInGUI = null;

// /**
//  * Touch started. Ignores gui touches. Called dynamically.
//  * @param  {Event} e The event object.
//  */
// app.Controls.prototype['onTouchstart'] = function(e) {
//   // Ignore the touch if it starts in GUI
//   this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
//   if (this.touchStartedInGUI) {
//     return;
//   }

//   var touch = e.originalEvent.changedTouches[0];

//   this.currentTouchId = touch.identifier;
//   this.currentTouchStartY = touch.pageY;
//   e.preventDefault();

//   // Let tutorial know about touch so it can hide the tutorial.
//   if (!this.touchStarted) {
//     this.tutorial_.off('touch-updown');
//     this.touchStarted = true;
//   }

// }

// /**
//  * Touch moved. Called dynamically.
//  * @param  {Event} e The event object.
//  * @this {Controls} The Controls object.
//  */
// app.Controls.prototype['onTouchmove'] = function(e) {
//   e.preventDefault();
// }

// /**
//  * Touch ended. Called dynamically.
//  * @param  {Event} e The event object.
//  * @this {Controls} The Controls object.
//  */
// app.Controls.prototype['onTouchend'] = function(e) {
//   var touch = this.getCurrentTouch(e.originalEvent);
//   if (!touch) {
//     return;
//   }

//   var touchDiff = this.currentTouchStartY - touch.pageY;

//   if (touchDiff >= 0) {
//     this.player_.onUp();
//   } else if (touchDiff < -25) {
//     this.player_.onDown(2);
//   }

//   this.currentTouchId = null;
// }

// /**
//  * Returns the active touch from a touch event.
//  * @param  {Event} e A touch event.
//  * @return {Touch}   The active touch.
//  */
// app.Controls.prototype.getCurrentTouch = function(e) {
//   if (this.currentTouchId === null) {
//     return;
//   }

//   for (var i = 0, touch; touch = e.changedTouches[i]; i++) {
//     if (touch.identifier === this.currentTouchId) {
//       return touch;
//     }
//   }
// }

