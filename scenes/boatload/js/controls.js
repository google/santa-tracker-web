goog.provide('Controls');

/**
 * Handles user input for controlling the game.
 * @param {SB.Game} game The game object.
 * @constructor
 */
Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.player = this.game.player;
  this.tutorial = this.game.tutorial;

  // Touch state
  this.currentTouchId = null;

  // Let's bind our events.
  var handler = this.handle.bind(this);
  this.game.elem.on('touchstart.boatload touchmove.boatload touchend.boatload', handler);
  $(window).on('keydown.boatload keyup.boatload', handler);
};

/**
 * Keep track of the up key.
 * @type {boolean}
 * @private
 */
Controls.prototype.isUpDown_ = false;

/**
 * Keep track of the down key.
 * @type {boolean}
 * @private
 */
Controls.prototype.isDownDown_ = false;

/**
 * Keep track of the space bar.
 * @type {boolean}
 * @private
 */
Controls.prototype.isSpaceDown_ = false;

/**
 * Keep track of player movements.
 * @type {boolean}
 * @private
 */
Controls.prototype.isMoving_ = false;

/**
 * Touch controls
 * @type {boolean}
 */
Controls.prototype.touchStartedInGUI = false;

/**
 * Handle all keyboard and touch events.
 * @param {Event} e The event data.
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
 * Handles the key down event. Called dynamically.
 * @param  {Event} e The event object.
 */
Controls.prototype['onKeydown'] = function(e) {
  if (e.keyCode === 38) { // Up
    this.isUpDown_ = true;
  } else if (e.keyCode === 40) { // Down
    this.isDownDown_ = true;
  } else if (e.keyCode === 32 && !this.isSpaceDown_) { // Space
    // Let tutorial know if space has been pressed
    // and hide tutorial when user presses the button
    if (!this.spacePressed) {
      this.tutorial.off('keys-space');
      this.spacePressed = true;
    }

    this.isSpaceDown_ = true;
    this.player.preparePresent();
  }

  if (!this.arrowPressed && (e.keyCode === 38 || e.keyCode === 40)) {
    // Let tutorial know if arrow has been pressed
    // and hide tutorial when user presses the button
    this.tutorial.off('keys-updown');
    this.arrowPressed = true;
  }

  this.updatePlayerFromKeyboard();
};

/**
 * Handles the key up event. Called dynamically.
 * @param  {Event} e The event object.
 */
Controls.prototype['onKeyup'] = function(e) {
  if (e.keyCode === 38) { // Up
    this.isUpDown_ = false;
  } else if (e.keyCode === 40) { // Down
    this.isDownDown_ = false;
  } else if (e.keyCode === 32) { // Space
    this.isSpaceDown_ = false;
    this.player.dropPresent();
  }
  this.updatePlayerFromKeyboard();
};

/**
 * Updates the player.
 */
Controls.prototype.updatePlayerFromKeyboard = function() {
  if (this.isUpDown_) {
    this.player.keyboardGoUp();
  } else if (this.isDownDown_) {
    this.player.keyboardGoDown();
  } else {
    this.player.keyboardStop();
  }

  // Pull sound
  if (!this.isUpDown_ && !this.isDownDown_) {
    this.isMoving_ = false;
  } else if (!this.isMoving_) {
    this.isMoving_ = true;
  }
};

/**
 * Touch started. Ignores gui touches. Called dynamically.
 * @param {Event} e The event object.
 */
Controls.prototype['onTouchstart'] = function(e) {
  // Ignore the touch if it starts in GUI
  this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
  if (this.touchStartedInGUI) return;

  // If no end event was fired
  if (this.currentTouchId !== null) {
    this.player.touchEnded();
  }

  // Correct position if game is scaled
  var touch = e.originalEvent.changedTouches[0];
  var touchY = touch.pageY * (1 / this.game.scale);

  this.currentTouchId = touch.identifier;
  this.player.setY(touchY);
  this.player.preparePresent();
  e.preventDefault();

  // Let tutorial know about touch so it can hide the tutorial.
  if (!this.touchStarted) {
    this.tutorial.off('touch-updown');
    this.touchStarted = true;
  }
};

/**
 * Touch moved. Called dynamically.
 * @param {Event} e The event object.
 */
Controls.prototype['onTouchmove'] = function(e) {
  var touch = this.getCurrentTouch(e.originalEvent);
  if (touch) {
    // Correct position if game is scaled
    var touchY = touch.pageY * (1 / this.game.scale);

    this.player.setY(touchY);
  }
  e.preventDefault();
};

/**
 * Touch ended. Called dynamically.
 * @param {Event} e The event object.
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
 * @param {Event} e A touch event.
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
