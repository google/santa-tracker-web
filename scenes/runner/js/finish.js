goog.provide('app.Finish');

goog.require('Constants');

/**
 * Finish class
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Finish = function(game) {
  this.game = game;
  this.elem = game.context.find('.finish');
  this.width = Constants.FINISH.width;
  this.height = Constants.FINISH.height;

  this.dead = false;
};

/**
 * Place the finish sign at the given position.
 * @param  {number} xPos Position to place the finish at.
 */
app.Finish.prototype.place = function(xPos) {
  this.x = xPos;
  this.dead = false;

  this.elem
      .css('transform', 'translate3d(' + this.x + 'px, 0, 0)');
  this.elem.removeClass('hidden');
};

/**
 * Checks if the finish has left the viewport.
 */
app.Finish.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    this.dead = true;
  }
};

/**
 * Called when the finish is hit by the player.
 * @param  {app.Player} player The player.
 */
app.Finish.prototype.hit = function(player) {
  player.newState(Constants.REINDEER_STATE_JUMPING);
  player.ySpeed = Constants.REINDEER_FINISH_Y_SPEED;
};

/**
 * Get the current hitbox of the finish.
 * @return {Object} The hitbox.
 */
app.Finish.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: -this.height,
    width: this.width,
    height: 0
  };
};
