goog.provide('Player');

goog.require('Constants');

/**
 * Movement and present drop for the player.
 * @constructor
 * @param {Game} game The game object.
 * @param {jQuery} elem The player element.
 */
Player = function(game, elem) {
  this.game = game;
  this.elem = elem;
  this.railsElem = this.game.elem.find('.player-rails');
  this.elfElem = this.elem.find('.player-elf');
  this.leftRopeElem = this.elem.find('.player-rope--left');
  this.rightRopeElem = this.elem.find('.player-rope--right');

  this.reset();

  this.animate = this.animate.bind(this);
}

/**
 * Resets the player for a new game.
 */
Player.prototype.reset = function() {
  this.targetY = this.y = this.game.sceneSize.height / 2;
  this.minY = this.game.sceneSize.height * 0.15;
  this.maxY = this.game.sceneSize.height * 0.82;
  var railsHeight = this.maxY - this.minY;
  this.railsElem.css({
    height: railsHeight - (railsHeight % 20) + 80,
    top: this.minY - 25
  });

  if (!this.present) {
    this.present = Present.pop(this.game, this.y - 10);
  } else {
    this.present.onInit(this.y - 10);
  }
  this.soundFrameCounter = 0;
  this.isMoving = false;
  this.throwing = false;

  this.elem.css('transform',
      'translateY(' + (this.y - Constants.PLAYER_CENTER) + 'px) translateZ(0)');

  Coordinator.reset();
  this.waiting = false;
  this.prepared = false;
  this.preparing = false;
  this.animate(0);
};

/**
 * Moves the player each frame based on keyboard input.
 * @param  {number} delta Time since last frame.
 */
Player.prototype.onFrame = function(delta) {
  // Update sounds.
  if (this.isMoving !== (this.targetY !== this.y)) {
    this.isMoving = !this.isMoving;
  }

  // Guard, we don't need to do anything else unless we're moving.
  if (!this.isMoving) {
    return;
  }

  var moved = delta * Constants.PLAYER_MAX_SPEED;
  if (moved > Math.abs(this.targetY - this.y)) {
    this.y = this.targetY;
    if (this.dropWhenStopped) {
      this.dropWhenStopped = false;
      this.dropPresent();
    }
  } else {
    this.y += moved * (this.targetY > this.y ? 1 : -1);
  }
  this.elem.css('transform',
      'translateY(' + (this.y - Constants.PLAYER_CENTER) + 'px) translateZ(0)');

  if (this.present) {
    this.present.y = this.y - 10;
    this.present.draw();
  }

  // Update sound position max 10 times per second.
  if (this.soundFrameCounter === 0) {
    var position = (this.y - this.minY) / (this.maxY - this.minY);
  }
  this.soundFrameCounter = (this.soundFrameCounter + 1) % 3;
};

/**
 * Sets a target y position for the player.
 * @param {number} y An absolute y position which the player should move to.
 */
Player.prototype.setY = function(y) {
  if (y < this.minY) {
    y = this.minY;
  } else if (y > this.maxY) {
    y = this.maxY;
  }

  this.targetY = y;
};

/**
 * Makes the player go up.
 */
Player.prototype.keyboardGoUp = function() {
  this.setY(this.minY);
};

/**
 * Makes the player go down.
 */
Player.prototype.keyboardGoDown = function() {
  this.setY(this.maxY);
};

/**
 * Makes the player stop.
 */
Player.prototype.keyboardStop = function() {
  this.setY(this.y);
};

/**
 * Touch ended. If stopped, drop present, otherwise finish movement, then drop.
 */
Player.prototype.touchEnded = function() {
  if (this.y === this.targetY) {
    this.dropPresent();
  } else {
    this.dropWhenStopped = true;
  }
};

/**
 * Release the present.
 * @private
 */
Player.prototype.releasePresent_ = function() {
  this.game.dropPresent(this.present);
  this.present = null;
  this.throwing = false;

  this.waiting = true;
  window.setTimeout(function() {
    if (this.present) return;

    this.present = Present.pop(this.game, this.y - 10);
    this.waiting = false;
    if (this.autoPrepare) {
      this.preparePresent();
    }
  }.bind(this), Constants.TIME_BETWEEN_PRESENTS * 1000);
};

/**
 * Drop the present.
 * @private
 */
Player.prototype.dropPresent_ = function() {
  this.throwing = true;
  Coordinator.stepReverse(0.1, this.animate, function() {
    this.releasePresent_();
  }.bind(this));
};

/**
 * Drop the present.
 */
Player.prototype.dropPresent = function() {
  if (this.prepared) {
    this.prepared = false;
    this.dropPresent_();
  } else if (this.preparing) {
    this.dropWhenPrepared = true;
  }
  this.autoPrepare = false;
};

/**
 * Animate the player.
 * @param  {Number} status The animation progress (between 0 and 1).
 */
Player.prototype.animate = function(status) {
  var left = -60 * status;
  var scale = .48 + .2 * status;
  var rotate = 14 + 36 * status;
  this.elfElem.css('transform', 'translateX(' + left + 'px) translateZ(0)');
  this.present.addX = left;
  this.present.draw();
  this.leftRopeElem.css('transform',
      'scaleY(' + scale + ') rotate(' + rotate + 'deg) translateZ(0)');
  this.rightRopeElem.css('transform',
      'scaleY(' + scale + ') rotate(-' + rotate + 'deg) translateZ(0)');
};

/**
 * Prepare the present.
 */
Player.prototype.preparePresent = function() {
  if (this.waiting) {
    this.autoPrepare = true;
    return;
  }

  if (this.preparing || this.throwing || !this.present) return;

  this.preparing = true;
  window.santaApp.fire('sound-trigger', 'bl_rope_stretch');

  Coordinator.step(0.3, this.animate, function() {
    this.preparing = false;

    if (this.dropWhenPrepared) {
      this.dropWhenPrepared = false;
      this.dropPresent_();
    } else {
      this.prepared = true;
    }
  }.bind(this));
};
