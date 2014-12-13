goog.provide('app.Present');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Present class.
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Present = function(game) {
  this.game = game;
  this.presentsElem = game.context.find('.presents');
  this.elem = $('<div class="present-wrap hidden"><div class="present">' +
    '<div class="present__inner"></div></div></div>');
  this.presentElem = this.elem.find('.present');

  this.presentsElem.append(this.elem);
};

/**
 * Create pool for presents.
 */
app.shared.pools.mixin(app.Present);

/**
 * Reset the present for reuse.
 * @param  {number} startX Initial position to place the present at.
 * @param  {number} startY  The height to place this present at.
 */
app.Present.prototype.onInit = function(startX, startY) {
  this.elem.removeClass().addClass('present-wrap');
  this.presentElem.removeClass('present--collected');
  this.dead = false;
  this.collected = false;

  var type;
  if (Math.random() < .03) {
    type = Constants.TREATS[Math.floor(Math.random() *
        Constants.TREATS.length)];
  } else {
    type = Constants.PRESENTS[Math.floor(Math.random() *
        Constants.PRESENTS.length)];
  }
  this.elem.addClass(type.css);

  this.score = type.score;
  this.width = type.width;
  this.height = type.height;
  this.x = startX;
  this.y = -startY - this.height / 2;

  this.draw();
};

/**
 * Remove the present from the game loop and hide it.
 */
app.Present.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Checks if the present is still in view and update position in magnet mode.
 */
app.Present.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    app.Present.push(this);
  }

  if (this.game.magnetMode &&
      this.game.player.state != Constants.REINDEER_STATE_COLLISION) {
    var playerDistance = this.distanceFromPlayer();
    if (playerDistance.dist < Constants.REINDEER_MAGNET_STRENGTH) {
      this.x += playerDistance.xDiff / 10;
      this.y += playerDistance.yDiff / 10;
      this.draw();
    }
  }
};

/**
 * Called when the present is hit by the player.
 */
app.Present.prototype.hit = function() {
  if (!this.collected) {
    this.collected = true;
    this.presentElem.addClass('present--collected');
    this.game.hitPresent(this);
    window.santaApp.fire('sound-trigger', 'runner_present');
  }
};

/**
 * Draw the present.
 */
app.Present.prototype.draw = function() {
  this.elem
      .css('transform', 'translate3d(' + this.x + 'px, ' +
          this.y + 'px, 0)');
};

/**
 * Get the current hitbox of the present.
 * @return {Object} The hitbox.
 */
app.Present.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: this.y,
    width: this.width,
    height: this.height
  };
};

/**
 * Give the present a new x position
 * @param {number} newX The new x position.
 */
app.Present.prototype.setXPos = function(newX) {
  this.x = newX;
  this.draw();
};

/**
 * @return {Object} An object containing player distance information.
 */
app.Present.prototype.distanceFromPlayer = function() {
  var playerHitbox = this.game.player.getHitbox();
  var presentHitbox = this.getHitbox();

  var playerCenter = {
    x: playerHitbox.x + playerHitbox.width / 2,
    y: playerHitbox.y - playerHitbox.height / 2
  };

  var presentCenter = {
    x: presentHitbox.x + presentHitbox.width / 2,
    y: presentHitbox.y + presentHitbox.height / 2
  };

  return {
    xDiff: playerCenter.x - presentCenter.x,
    yDiff: playerCenter.y - presentCenter.y,
    dist: Math.sqrt(Math.pow(playerCenter.x - presentCenter.x, 2) +
        Math.pow(playerCenter.y - presentCenter.y, 2))
  };
};
