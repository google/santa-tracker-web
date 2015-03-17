goog.provide('app.Platform');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Platform class
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Platform = function(game) {
  this.game = game;
  this.platformsElem = game.context.find('.platforms');
  this.elem = $('<div class="platform hidden"></div>');

  this.platformsElem.append(this.elem);
};

/**
 * Create pool for platforms.
 */
app.shared.pools.mixin(app.Platform);

/**
 * Resets the platforms for reuse.
 * @param  {number} startX Initial position to place the platforms at.
 * @param  {number} level Which vertical level to place this platforms at.
 * @param  {boolean} opt_woodsy Whether to use the nature terrain
 *                              style platforms.
 */
app.Platform.prototype.onInit = function(startX, level, opt_woodsy) {
  this.elem.removeClass().addClass('platform');
  this.dead = false;

  var platformArray = level > 0 ? Constants.PLATFORMS_TALL :
      Constants.PLATFORMS_SHORT;
  var index = opt_woodsy ? platformArray.length - 1 :
      Math.floor(Math.random() * (platformArray.length - 1));

  var type = platformArray[index];
  this.elem.addClass(type.css);

  this.x = startX;
  this.width = type.width;
  this.height = type.height;

  this.draw();
};

/**
 * Remove the platform from the game loop and hide it.
 */
app.Platform.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Checks if the platform is still in view.
 */
app.Platform.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    app.Platform.push(this);
  }
};

/**
 * Draw the platform.
 */
app.Platform.prototype.draw = function() {
  this.elem
      .css('transform', 'translate3d(' + this.x + 'px, 0, 0)');
};

/**
 * Called when the platform is hit by the player.
 * @param  {app.Player} player The player.
 */
app.Platform.prototype.hit = function(player) {
};

/**
 * Get the current hitbox of the platform.
 * @return {Object} The hitbox.
 */
app.Platform.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: -this.height,
    width: this.width,
    height: 0
  };
};
