goog.provide('app.ScoreItem');

goog.require('app.Constants');
goog.require('app.Item');
goog.require('app.shared.pools');



/**
 * Constructor for scoring items that the player can catch.
 * @constructor
 * @extends {Item}
 * @param {Game} game The game object.
 */
app.ScoreItem = function(game) {
  app.Item.call(this, game);
};


/**
 * Inherit the Item prototype
 * @type {Item}
 */
app.ScoreItem.prototype = Object.create(app.Item.prototype);


/**
 * Create a pool for TimeItem
 */
app.shared.pools.mixin(app.ScoreItem);


/**
 * Initializes the item for reuse.
 */
app.ScoreItem.prototype.onInit = function() {
  this.type = this.weightedRandomType(app.Constants.ITEM_WEIGHT);
  this.reset();
};


/**
 * Registers a collision with the player.
 */
app.ScoreItem.prototype.hit = function() {
  var score = app.ScoreItem.calculateScore_(this.game.level, this.type);
  this.triggerHit(score, 0, score);
};


/**
 * Returns the score received for catching this item. Can be tweaked for
 * different scoring rules.
 * @param {number} level The current level, 0-based.
 * @param {ItemType} type The type of the item giving the score.
 * @return {number} The score received.
 * @private
 */
app.ScoreItem.calculateScore_ = function(level, type) {
  return (type.fast ? app.Constants.ITEM_SCORE_FAST : app.Constants.ITEM_SCORE_NORMAL) * (level + 1);
};
