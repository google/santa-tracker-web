goog.provide('app.DangerItem');

goog.require('app.Constants');
goog.require('app.Item');
goog.require('app.shared.pools');



/**
 * Constructor for scoring items that the player can catch.
 * @constructor
 * @extends {Item}
 * @param {Game} game The game object.
 */
app.DangerItem = function(game) {
  app.Item.call(this, game);
  this.elem.addClass('item--danger');
  this.types = app.Constants.DANGER_TYPES;
};


/**
 * Inherit the Item prototype
 * @type {Item}
 */
app.DangerItem.prototype = Object.create(app.Item.prototype);


/**
 * Create a pool for app.DangerItem
 */
app.shared.pools.mixin(app.DangerItem);


/**
 * Initializes the item for reuse.
 */
app.DangerItem.prototype.onInit = function() {
  // Pick a danger item
  this.type = this.weightedRandomType(app.Constants.DANGER_WEIGHT);
  var birdType = parseInt(this.type.css[this.type.css.length - 1]);

  // Reset base properties
  this.reset();

  // Danger items fall at different speeds
  this.speed *= app.Constants.DANGER_SPEED_SCALE;

  // Birds flow from right or left
  if (birdType === 3) {
    this.x = app.Constants.SCENE_WIDTH + 150;
    this.y = app.DangerItem.randomNumber_(0, 0.2) * app.Constants.SCENE_HEIGHT;
    this.flowDirection = 'left';
    this.elem.css('left', 'auto');
  } else if (birdType === 4) {
    this.x = -150;
    this.y = app.DangerItem.randomNumber_(0, 0.2) * app.Constants.SCENE_HEIGHT;
    this.elem.css('left', 0);
    this.flowDirection = 'right';
  }

  // Override hit sound.
  this.sound = 'jetpack_hit';
};


/**
 * Registers a collision with the player.
 */
app.DangerItem.prototype.hit = function() {
  var score = -(~~(this.game.scoreboard.score * app.DangerItem.randomNumber_(0, 0.2)));
  var time = -(~~(this.game.scoreboard.lastSeconds * app.DangerItem.randomNumber_(0, 0.2)));
  this.triggerHit(score, time, score);
};


/**
 * Returns a random number between min and max
 * @param {number} min
 * @param {number} max
 * @return {number}
 * @private
 */
app.DangerItem.randomNumber_ = function(min, max) {
  return Math.random() * (max - min) + min;
};
