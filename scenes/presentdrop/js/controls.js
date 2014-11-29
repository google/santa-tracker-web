goog.provide('Controls');

/**
 * Handles user input for controlling the game.
 * @param {Game} game The game object.
 * @constructor
 */
Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.player = this.game.player;
  this.tutorial = this.game.tutorial;

  // For converting mouse/touch positions to stage positions.
  this.stage = this.game.elem.find('.stage');

  // Touch state
  this.currentTouchId = null;

  // Let's bind our events.
  var handler = this.handle.bind(this);
  this.game.elem.on('touchstart.presentdrop touchmove.presentdrop touchend.presentdrop', handler);
  $(window).on('keydown.presentdrop keyup.presentdrop', handler);
}

/**
 * Handle all keyboard and touch events.
 * @param {event} e The event data.
 */
Controls.prototype.handle = function(e) {
  // Paused or Gameover
  if (!this.game.isPlaying) {
    return;
  }

  var methodName = 'on' + e.type[0].toUpperCase() + e.type.slice(1);
  this[methodName](e);
};

/**
 * Keep track of the right key.
 * @type {bool}
 * @private
 */
Controls.prototype.isRightDown_ = false;

/**
 * Keep track of the left key.
 * @type {bool}
 * @private
 */
Controls.prototype.isLeftDown_ = false;

/**
 * Keep track of the space bar.
 * @type {bool}
 * @private
 */
Controls.prototype.isSpaceDown_ = false;

/**
 * Keep track of player movements.
 * @type {bool}
 * @private
 */
Controls.prototype.isMoving_ = false;

/**
 * Handles the key down event. Called dynamically.
 * @param  {Event} e The event object.
 */
Controls.prototype['onKeydown'] = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = true;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = true;
  } else if (e.keyCode === 32 && !this.isSpaceDown_) { // Space
    // Let tutorial know if space has been pressed
    // and hide tutorial when user presses the button
    if (!this.spacePressed) {
      this.tutorial.off('keys-space');
      this.spacePressed = true;
    }

    this.isSpaceDown_ = true;
    this.player.dropPresent();
  }

  if (!this.arrowPressed && (e.keyCode === 37 || e.keyCode === 39)) {
    // Let tutorial know if arrow has been pressed
    // and hide tutorial when user presses the button
    this.tutorial.off('keys-leftright');
    this.arrowPressed = true;
  }

  this.updatePlayerFromKeyboard();
};

/**
 * Handles the key up event. Called dynamically.
 * @param  {Event} e The event object.
 * @this {Controls} The Controls object.
 */
Controls.prototype['onKeyup'] = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = false;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = false;
  } else if (e.keyCode === 32) { // Space
    this.isSpaceDown_ = false;
  }
  this.updatePlayerFromKeyboard();
};

/**
 * Updates the player.
 */
Controls.prototype.updatePlayerFromKeyboard = function() {
  if (this.isRightDown_) {
    this.player.keyboardGoRight();
  } else if (this.isLeftDown_) {
    this.player.keyboardGoLeft();
  } else {
    this.player.keyboardStop();
  }

  // Pull sound
  if (!this.isRightDown_ && !this.isLeftDown_) {
    this.isMoving_ = false;
  } else if (!this.isMoving_) {
    this.isMoving_ = true;
  }
};

/**
 * Touch controls
 */
Controls.prototype.touchStartedInGUI = null;

/**
 * Touch started. Ignores gui touches. Called dynamically.
 * @param  {Event} e The event object.
 */
Controls.prototype['onTouchstart'] = function(e) {
  // Ignore the touch if it starts in GUI or if we are already tracking a touch.
  this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
  if (this.currentTouchId !== null || this.touchStartedInGUI) {
    return;
  }

  var stagePos = this.stage.offset();
  var touch = e.originalEvent.changedTouches[0];

  // Correct position if game is scaled
  var touchX = touch.pageX / this.game.scale;
  var stageLeft = stagePos.left / this.game.scale;

  this.currentTouchId = touch.identifier;
  this.player.setX(touchX - stageLeft);
  e.preventDefault();

  // Let tutorial know about touch so it can hide the tutorial.
  if (!this.touchStarted) {
    this.tutorial.off('touch-leftright');
    this.touchStarted = true;
  }
};

/**
 * Touch moved. Called dynamically.
 * @param  {Event} e The event object.
 * @this {Controls} The Controls object.
 */
Controls.prototype['onTouchmove'] = function(e) {
  var touch = this.getCurrentTouch(e.originalEvent);
  if (touch) {
    var stagePos = this.stage.offset();

    // Correct position if game is scaled
    var touchX = touch.pageX / this.game.scale;
    var stageLeft = stagePos.left / this.game.scale;

    this.player.setX(touchX - stageLeft);
  }
  e.preventDefault();
};

/**
 * Touch ended. Called dynamically.
 * @param  {Event} e The event object.
 * @this {Controls} The Controls object.
 */
Controls.prototype['onTouchend'] = function(e) {
  var touch = this.getCurrentTouch(e.originalEvent);
  if (!touch) {
    return;
  }

  this.currentTouchId = null;
  this.player.touchEnded();
};

/**
 * Returns the active touch from a touch event.
 * @param  {Event} e A touch event.
 * @return {Touch}   The active touch.
 */
Controls.prototype.getCurrentTouch = function(e) {
  if (this.currentTouchId === null) {
    return;
  }

  for (var i = 0, touch; touch = e.changedTouches[i]; i++) {
    if (touch.identifier === this.currentTouchId) {
      return touch;
    }
  }
};
