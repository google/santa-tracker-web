goog.provide('app.Player');

/**
 * Movement and present drop for the player.
 * @constructor
 * @param {!app.Game} game The game object.
 * @param {!jQuery} elem The player element.
 */
app.Player = function(game, elem) {
  this.game = game;
  this.elem = $(elem);
  this.ropeElvesElem = $('.elf-rope');
};

/**
 * Resets the player for a new game.
 */
app.Player.prototype.reset = function() {
  this.targetX = this.x = app.Constants.PLAYER_START_X;
  this.lastElfPull = null;
  this.dropWhenStopped = false;
  this.hasPresent = true;
  this.soundFrameCounter = 0;
  this.isMoving = false;
  this.elem.css('left', (this.x - app.Constants.PLAYER_CENTER) + 'px');
};

/**
 * Moves the player each frame based on keyboard input.
 * @param {number} delta tim in seconds since last frame.
 */
app.Player.prototype.onFrame = function(delta) {
  // Update sounds.
  if (this.isMoving !== (this.targetX !== this.x)) {
    this.isMoving = !this.isMoving;
    window.santaApp.fire('sound-trigger', this.isMoving ? 'pd_pull_start' : 'pd_pull_stop');
  }

  // Guard, we don't need to do anything else unless we're moving.
  if (!this.isMoving) {
    return;
  }

  var moved = delta * app.Constants.PLAYER_MAX_SPEED;
  if (moved > Math.abs(this.targetX - this.x)) {
    this.x = this.targetX;
    if (this.dropWhenStopped) {
      this.dropWhenStopped = false;
      this.dropPresent();
    }
  } else {
    this.x += moved * (this.targetX > this.x ? 1 : -1);
  }
  this.elem.css('left', (this.x - app.Constants.PLAYER_CENTER) + 'px');

  // Update sound position max 10 times per second.
  if (this.soundFrameCounter === 0) {
    var position = (this.x - app.Constants.PLAYER_MIN_X) /
        (app.Constants.PLAYER_MAX_X - app.Constants.PLAYER_MIN_X);
    window.santaApp.fire('sound-trigger', {name: 'pd_sled_position', args: [position * 2 - 1]});
  }
  this.soundFrameCounter = (this.soundFrameCounter + 1) % 3;
};

/**
 * Sets a target x position for the player.
 * @param {number} x An absolute x position which the player should move to.
 */
app.Player.prototype.setX = function(x) {
  if (x < app.Constants.PLAYER_MIN_X) {
    x = app.Constants.PLAYER_MIN_X;
    window.santaApp.fire('sound-trigger', 'pd_player_crash');
  } else if (x > app.Constants.PLAYER_MAX_X) {
    x = app.Constants.PLAYER_MAX_X;
    window.santaApp.fire('sound-trigger', 'pd_player_crash');
  }

  this.targetX = x;

  // Update elves
  if (x !== this.x && x > this.x !== this.lastElfPull) {
    this.lastElfPull = x > this.x;
    this.ropeElvesElem.toggleClass('back', this.lastElfPull);
  }
};

/**
 * Makes the player go right.
 */
app.Player.prototype.keyboardGoRight = function() {
  this.setX(app.Constants.PLAYER_MAX_X);
};

/**
 * Makes the player go left.
 */
app.Player.prototype.keyboardGoLeft = function() {
  this.setX(app.Constants.PLAYER_MIN_X);
};

/**
 * Makes the player stop.
 */
app.Player.prototype.keyboardStop = function() {
  this.setX(this.x);
};

/**
 * Touch ended. If stopped, drop present, otherwise finish movement, then drop.
 */
app.Player.prototype.touchEnded = function() {
  if (this.x === this.targetX) {
    this.dropPresent();
  } else {
    this.dropWhenStopped = true;
  }
};

/**
 * Drop a present.
 */
app.Player.prototype.dropPresent = function() {
  if (!this.hasPresent) return;

  this.game.createPresent(this.x);
  this.hasPresent = false;

  utils.animWithClass(this.elem.find('.elf'), 'newpresent');
  window.santaApp.fire('sound-trigger', 'pd_item_drop');

  window.setTimeout(function() {
    this.hasPresent = true;
  }.bind(this), app.Constants.TIME_BETWEEN_PRESENTS * 1000);
};
