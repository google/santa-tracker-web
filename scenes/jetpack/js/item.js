goog.provide('app.Item');

goog.require('app.Constants');



/**
 * Represents all items that the player can catch.
 * @constructor
 * @param {Game} game The game object.
 */
app.Item = function(game) {
  /** @type {Game} */
  this.game = game;

  /** @type {jQuery} */
  this.elem = $('<div class="item hidden">');
  this.subElem = $('<div>').appendTo(this.elem);

  /** @type {boolean} */
  this.dead = false;

  /** @type {boolean} */
  this.isHit = false;

  /** @type {object} enumerable */
  this.flowDirection = null;

  /**
   * Arry of types associated with this item.
   * @type {Array.<app.Constants.ItemType>|app.Constants.ITEM_TYPES|*}
   */
  this.types = app.Constants.ITEM_TYPES;

  /** @type {app.Constants.ItemType} */
  this.type = null;

  /** @type {number} */
  this.speed = 0;

  /** @type {number} */
  this.x = 0;

  /** @type {number} */
  this.y = 0;

  this.game.itemsElem.append(this.elem);
};


/**
 * Resets the item so it can be reused.
 */
app.Item.prototype.reset = function() {
  this.elem.removeClass('hidden');
  this.subElem[0].textContent = '';
  this.dead = false;
  this.isHit = false;
  this.flowDirection = null;

  // Assign the visual look
  this.subElem.attr('class', this.type.css);

  // Figure out the speed
  this.speed = (this.type.fast ? app.Constants.ITEM_SPEED_FAST : app.Constants.ITEM_SPEED_NORMAL);
  this.speed *= Math.pow(app.Constants.ITEM_SPEED_MULTIPLY_EACH_LEVEL, this.game.level);

  // Initial placement
  this.x = Math.random() * app.Constants.SCENE_WIDTH;
  this.y = -150;
  this.elem.css('left', this.x + 'px');
  this.sound = this.type.css.indexOf('present') !== -1 ?
      'jp_pickup_parachute_item' : 'jp_pickup_item';
};


/**
 * Removes this item from the game loop.
 */
app.Item.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};


/**
 * Update this item by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
app.Item.prototype.onFrame = function(delta) {
  var x = 0;
  this.y += this.speed * delta;

  if (this.flowDirection) {
    this.x += app.Item.flowDirections_[this.flowDirection] * (this.speed * delta);
    x = this.x;
  }

  if (this.y < this.game.sceneSize.height + 150 &&
      this.x > - 200 && this.x < this.game.sceneSize.width + 200) {
    this.elem.css('transform', 'translate3d(' + x + 'px, ' + this.y + 'px, 0)');
  } else {
    this.remove();
  }
};


/**
 * Returns a random type with weighting.
 * @param {number} weight Total weight of item type.
 * @return {app.Constants.ClockType} The item type picked.
 */
app.Item.prototype.weightedRandomType = function(weight) {
  var value = Math.random() * (weight || app.Constants.ITEM_WEIGHT);

  for (var i = 0, type; type = this.types[i]; i++) {
    value -= type.weight;

    if (value < 0) {
      return type;
    }
  }

  return type;
};


/**
 * Registers a collision with the player.
 * @param {number} score
 * @param {number} time in seconds.
 * @param {string} message displayed to player.
 */
app.Item.prototype.triggerHit = function(score, time, message) {
  this.isHit = true;
  this.game.caughtItem(score, time);
  this.subElem.attr('class', 'item-score')[0].textContent = message;
  window.santaApp.fire('sound-trigger', this.sound);
};


/**
 * Enumerable left or right.
 * @type {{left: number, right: number}}
 * @private
 */
app.Item.flowDirections_ = {
  'left': -1,
  'right': 1
};
