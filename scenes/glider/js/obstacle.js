goog.provide('app.Obstacle');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.pools');

/**
 * Represents different obstacles the player should not hit.
 * @constructor
 * @param {Game} game The game object.
 */
app.Obstacle = function(game) {
  app.Entity.call(this);

  /** @type {Game} */
  this.game = game;

  /** @type {jQuery} */
  this.elem = $('<div class="obstacle hidden">');
  this.subElem = $('<div>').appendTo(this.elem);

  /** @type {boolean} */
  this.dead = false;

  /** @type {Constants.ItemType} */
  this.type = null;

  /** @type {number} */
  this.speed = 0;

  /** @type {boolean} */
  this.animateBack = false;

  this.game.obstaclesElem.append(this.elem);
};

/**
 * Inherit from entity.
 */
app.Obstacle.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Obstacle);

/**
 * Resets the item so it can be reused.
 */
app.Obstacle.prototype.onInit = function() {
  this.elem.removeClass('hidden');
  this.subElem[0].textContent = '';
  this.dead = false;

  // Pick a type
  this.type = app.Obstacle.pickRandomType();

  // Set width and height in ems
  this.width = this.type.width;
  this.height = this.type.height;
  this.xgap = this.type.xgap;
  this.ygap = this.type.ygap;
  this.marginTop = 0;

  if (this.type.margintop) {
    this.marginTop = this.type.margintop;
  }

  // Assign the visual look
  this.elem.attr('class', 'obstacle ' + this.type.css);

  // Figure out the speed
  this.speed = (this.type.fast ? Constants.ITEM_SPEED_FAST : Constants.ITEM_SPEED_NORMAL);
  this.speed *= Math.pow(Constants.OBSTACLE_SPEED_MULTIPLY_EACH_LEVEL, this.game.level);

  // Initial placement
  this.setPos(this.game.sceneSize.width,
              Math.random() * this.game.sceneSize.height * 0.4 + this.marginTop);
  this.yVariance = 0;
  this.elem.css('top', this.y + 'em');
};

/**
 * Removes this item from the game loop.
 */
app.Obstacle.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Update this item by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
app.Obstacle.prototype.onFrame = function(delta) {
  this.setX(this.x - this.speed * delta);
  if (this.animateBack) {
    this.yVariance -= this.speed * delta;
    if (this.yVariance <= 0) {
      this.animateBack = false;
    }
  } else {
    this.yVariance += this.speed * delta;
    if (this.yVariance >= this.type.yVariance) {
      this.animateBack = true;
    }
  }

  if (this.screenX > -this.type.width) {
    this.elem.css('transform', 'translate3d(' + this.x + 'em, ' + this.yVariance + 'em, 0)');
  } else {
    this.elem.css('transform', '');
    this.remove();
  }
};

/**
 * Registers a collision with the player.
 */
app.Obstacle.prototype.hit = function() {
  var self = this,
      score = app.Item.calculateScore_(this.game.level, this.type);
  this.game.player.hit();
  window.santaApp.fire('sound-trigger', 'glider_hit');

  if (this.type.css == 'animated balloon') {
    this.elem.addClass('pop');
    setTimeout(function() {
      self.elem.removeClass('pop');
      self.elem.css('transform', '');
      self.remove();
    }, 500);
  }
};

/**
 * Returns the score received for catching this item. Can be tweaked for
 * different scoring rules.
 * @param {number} level The current level, 0-based.
 * @param {ItemType} type The type of the item giving the score.
 * @return {number} The score received.
 * @private
 */
app.Obstacle.calculateScore_ = function(level, type) {
  return (type.fast ? Constants.ITEM_SCORE_FAST : Constants.ITEM_SCORE_NORMAL) * (level + 1);
};

/**
 * Returns a random obstacle type with its details.
 * @return {Constants.OBSTACLE_TYPES} The obstacle type picked.
 */
app.Obstacle.pickRandomType = function() {
  var value = Math.floor(Math.random() * (Constants.OBSTACLE_TYPES.length));
  return Constants.OBSTACLE_TYPES[value];
};

