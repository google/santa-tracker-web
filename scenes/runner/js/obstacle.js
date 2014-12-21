goog.provide('app.Obstacle');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Obstacle class
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Obstacle = function(game) {
  this.game = game;
  this.obstaclesElem = game.context.find('.obstacles');
  this.elem = $('<div class="obstacle hidden"><div class="obstacle__inner">' +
      '</div></div>');

  this.obstaclesElem.append(this.elem);
};

/**
 * Create pool for obstacles.
 */
app.shared.pools.mixin(app.Obstacle);

/**
 * Resets the obstacle for reuse.
 * @param  {number} startX Initial position to place the obstacle at.
 * @param  {number} level Which vertical level to place this obstacle at.
 */
app.Obstacle.prototype.onInit = function(startX, level) {
  this.elem.removeClass().addClass('obstacle');
  this.dead = false;

  var obstacleArray = level > 0 ? Constants.OBSTACLES_PLATFORM :
      Constants.OBSTACLES_GROUND;
  var type = obstacleArray[
      Math.floor(Math.random() * obstacleArray.length)];
  this.elem.addClass(type.css);

  this.x = startX;
  this.y = level * -Constants.PLATFORM_HEIGHT;
  this.level = level;
  this.width = type.width;
  this.height = type.height;
  this.hitBottom = type.hitBottom || 0;
  this.hitCss = type.hitCss;
  this.hitWidth = type.hitWidth;

  if (level > 0) {
    this.presentsHeight = this.game.getPresentHeightForLevel(level + 0.5);
  } else {
    this.presentsHeight = type.presentsHeight;
  }

  this.draw();
};

/**
 * Remove the obstacle from the game loop and hide it.
 */
app.Obstacle.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Checks if the obstacle is still in view.
 */
app.Obstacle.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    app.Obstacle.push(this);
  }
};

/**
 * Draw the obstacle.
 */
app.Obstacle.prototype.draw = function() {
  this.elem
    .css('transform', 'translate3d(' + this.x + 'px, ' + this.y + 'px, 0)');
};

/**
 * Called when the obstacle is hit by the player.
 * @param  {app.Player} player The player.
 */
app.Obstacle.prototype.hit = function(player) {
  if (this.hitCss) {
    this.elem.addClass(this.hitCss);
  } else {
    player.newState(Constants.REINDEER_STATE_COLLISION);
    window.santaApp.fire('sound-trigger', 'runner_hit');
  }

  if (this.hitWidth) {
    this.width = this.hitWidth;
  }
};

/**
 * Get the current hitbox of the obstacle.
 * @return {Object} The hitbox.
 */
app.Obstacle.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: this.y - this.hitBottom,
    width: this.width,
    height: this.height
  };
};
