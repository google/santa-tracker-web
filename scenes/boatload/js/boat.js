goog.provide('Boat');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Manages a boat.
 * @constructor
 * @param {Game} game The current game object.
 */
var Boat = function(game) {
  this.game = game;
  this.elem = $('<div class="boat hidden"></div>');
  this.game.boatsElem.append(this.elem);
};

/**
 * Add methods for reusing objects.
 */
pools.mixin(Boat);

/**
 * Initializes the Boat for use.
 * @param {Constants.BoatType} type The type of boat in Constants.BOATS.
 */
Boat.prototype.onInit = function(type) {
  this.elem.removeClass('boat--1 boat--2 boat--3 hidden hit');
  this.dead = false;
  this.hitNumber = 0;
  this.nextBubble = 0;

  this.elem.addClass(type.css);
  this.height = type.height;
  this.width = type.width;
  this.speed = type.speed;
  this.sound = type.sound;

  this.bubbleVariance = Constants.BUBBLE_SPAWN_VARIANCE;
  this.bubbleInterval = Constants.BUBBLE_SPAWN_INTERVAL - this.bubbleVariance / 2;

  var viewOffset = this.game.viewElem.offset().top * (1 / this.game.scale);
  this.y = this.game.sceneSize.height - viewOffset;
  this.elem.css({
    top: -this.height,
    left: Constants.BOAT_X - (this.width / 2)
  });
  this.draw();
};

/**
 * Remove this boat from game loop and hide it.
 */
Boat.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Position the boat.
 */
Boat.prototype.draw = function() {
  this.elem.css('transform', 'translateY(' + (this.y + this.height) + 'px) translateZ(0)');
};

/**
 * Update this boat by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
Boat.prototype.onFrame = function(delta) {
  this.y -= this.game.boatSpeed * this.speed * delta;

  if (this.y > -this.height) {
    this.draw();
  } else {
    Boat.push(this);
  }

  // Bubbles
  this.nextBubble -= delta;
  if (this.nextBubble <= 0) {
    Bubble.pop(this.game, Math.random() * 10 - 5, this.y + this.height - 6, this.speed);
    this.nextBubble = this.bubbleInterval + Math.random() * this.bubbleVariance;
  }
};

/**
 * Registers a collision with the boat.
 * @param {Present} present The present.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
Boat.prototype.hit = function(present, x, y) {
  Present.push(present);

  var time = Constants.TIME_PER_BOAT;
  if (this.hitNumber > 0) {
    time = time / 2;
  }
  var score = Boat.calculateScore_(this.game.level, ++this.hitNumber);
  this.game.hitBoat(score, time, x, y);
  window.santaApp.fire('sound-trigger', this.sound);
};

/**
 * Calculate score depending on boat type and level number.
 * @param {number} level The current level, 0-based.
 * @param {number} hitNumber How many times has the boat been hit.
 * @return {number} The score received.
 * @private
 */
Boat.calculateScore_ = function(level, hitNumber) {
  var baseScore = Constants.SCORE_BOAT;
  var multiplier = Math.pow(2, Math.min(3, hitNumber));
  return (baseScore + level * baseScore) * multiplier;
};

/**
 * Get the current hitbox of the boat.
 * @return {{x: Number, y: Number, center: Number}} The hitbox.
 */
Boat.prototype.getHitbox = function() {
  return {
    center: this.height / 2 - 10,
    y: this.y,
    x: Constants.BOAT_X
  };
};
