goog.provide('Player');

/**
 * Movement and present drop for the player.
 * @constructor
 * @param {Game} game The game object.
 * @param {jQuery} elem The player element.
 */
Player = function(game, elem) {
  this.game = game;
  this.elem = $(elem);
  this.ropeElvesElem = $('.elf-rope');
};

/**
 * Resets the player for a new game.
 */
Player.prototype.reset = function() {
  this.targetX = this.x = Constants.PLAYER_START_X;
  this.lastElfPull = null;
  this.dropWhenStopped = false;
  this.hasPresent = true;
  this.soundFrameCounter = 0;
  this.isMoving = false;
  this.elem.css('left', (this.x - Constants.PLAYER_CENTER) + 'px');
};

/**
 * Moves the player each frame based on keyboard input.
 * @param  {number} delta Time since last frame.
 */
Player.prototype.onFrame = function(delta) {
  // Update sounds.
  if (this.isMoving !== (this.targetX !== this.x)) {
    this.isMoving = !this.isMoving;
    window.santaApp.fire('sound-trigger', this.isMoving ? 'pd_pull_start' : 'pd_pull_stop');
  }

  // Guard, we don't need to do anything else unless we're moving.
  if (!this.isMoving) {
    return;
  }

  var moved = delta * Constants.PLAYER_MAX_SPEED;
  if (moved > Math.abs(this.targetX - this.x)) {
    this.x = this.targetX;
    if (this.dropWhenStopped) {
      this.dropWhenStopped = false;
      this.dropPresent();
    }
  } else {
    this.x += moved * (this.targetX > this.x ? 1 : -1);
  }
  this.elem.css('left', (this.x - Constants.PLAYER_CENTER) + 'px');

  // Update sound position max 10 times per second.
  if (this.soundFrameCounter === 0) {
    var position = (this.x - Constants.PLAYER_MIN_X) /
        (Constants.PLAYER_MAX_X - Constants.PLAYER_MIN_X);
    window.santaApp.fire('sound-trigger', {name: 'pd_sled_position', args: [position * 2 - 1]});
  }
  this.soundFrameCounter = (this.soundFrameCounter + 1) % 3;
};

/**
 * Sets a target x position for the player.
 * @param {number} x An absolute x position which the player should move to.
 */
Player.prototype.setX = function(x) {
  if (x < Constants.PLAYER_MIN_X) {
    x = Constants.PLAYER_MIN_X;
    window.santaApp.fire('sound-trigger', 'pd_player_crash');
  } else if (x > Constants.PLAYER_MAX_X) {
    x = Constants.PLAYER_MAX_X;
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
Player.prototype.keyboardGoRight = function() {
  this.setX(Constants.PLAYER_MAX_X);
};

/**
 * Makes the player go left.
 */
Player.prototype.keyboardGoLeft = function() {
  this.setX(Constants.PLAYER_MIN_X);
};

/**
 * Makes the player stop.
 */
Player.prototype.keyboardStop = function() {
  this.setX(this.x);
};

/**
 * Touch ended. If stopped, drop present, otherwise finish movement, then drop.
 */
Player.prototype.touchEnded = function() {
  if (this.x === this.targetX) {
    this.dropPresent();
  } else {
    this.dropWhenStopped = true;
  }
};

/**
 * Drop a present.
 */
Player.prototype.dropPresent = function() {
  if (!this.hasPresent)
    return;

  this.game.createPresent(this.x);
  this.hasPresent = false;

  utils.animWithClass(this.elem.find('.elf'), 'newpresent');
  window.santaApp.fire('sound-trigger', 'pd_item_drop');

  var self = this;
  setTimeout(function() {
    self.hasPresent = true;
  }, Constants.TIME_BETWEEN_PRESENTS * 1000);
};
