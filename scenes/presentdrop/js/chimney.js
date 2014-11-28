goog.provide('Chimney');

goog.require('app.shared.pools');

/**
 * Manages a chimney.
 * @constructor
 * @param {Game} game The current game object.
 */
Chimney = function(game) {
  this.game = game;
  this.elem = $('<div class="train hidden">' +
      '<div class="flag"><div class="flag-stick"/><div class="flag-score"/></div>' +
      '<div class="handle" />' +
      '<div class="hand" />' +
      '<div class="chimney" />' +
      '<div class="wheel1" />' +
      '<div class="wheel2" /></div>');
  game.chimneysElem.append(this.elem);
};

app.shared.pools.mixin(Chimney);

/**
 * Resets the chimney for reuse.
 */
Chimney.prototype.onInit = function() {
  this.elem.removeClass('hidden hit');
  this.dead = false;
  this.hits = 0;

  this.x = Constants.CHIMNEY_START_X;
  if (Math.random() < 0.5) {
    this.elem.addClass('large');
    this.isLarge = true;
  }

  this.draw();
};

/**
 * Add instance back to pool.
 */
Chimney.prototype.remove = function() {
  Chimney.push(this);
};

/**
 * Remove this chimney from dom and game loop.
 */
Chimney.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Position the chimney.
 */
Chimney.prototype.draw = function() {
  this.elem.css('transform', 'translateX(' + this.x + 'px) translateZ(0)');
};

/**
 * Update this chimney by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
Chimney.prototype.onFrame = function(delta) {
  var speed = this.game.chimneySpeed;
  this.x -= speed * delta;

  if (this.x > Constants.CHIMNEY_END_X) {
    this.draw();
  } else {
    this.remove();
  }
};

/**
 * Registers a collision with the chimney.
 */
Chimney.prototype.hit = function() {
  this.hits++;

  var score = Chimney.calculateScore_(this.game.level, this.isLarge, this.hits);
  this.elem.find('.flag-score').text(score);
  this.elem.addClass('hit');
  this.game.hitChimney(score);
  this.hitTimer && window.clearTimeout(this.hitTimer);
  this.hitTimer = window.setTimeout(function() {
    this.elem.removeClass('hit');
  }.bind(this), Constants.CHIMNEY_FLAG_VISIBLE);
};

/**
 * Calculate score depending on chimney type and level number.
 * @param {number} level The current level, 0-based.
 * @param {bool} isLarge Calculate score for large or small chimney.
 * @param {number} hits Chimney hit count.
 * @return {number} The score received.
 * @private
 */
Chimney.calculateScore_ = function(level, isLarge, hits) {
  var baseScore = Constants['SCORE_CHIMNEY_' + (isLarge ? 'LARGE' : 'SMALL')];
  return (baseScore + level * baseScore) * Math.pow(2, hits);
};

/**
 * Get the current hitbox of the chimney.
 * @return {{x: number, y: number, center: number}} The hitbox.
 */
Chimney.prototype.getHitbox = function() {
  if (this.isLarge) {
     return {
      center: Constants.CHIMNEY_WIDTH_LARGE / 2,
      y: Constants.CHIMNEY_Y_LARGE,
      x: this.x + 25
    };
  } else {
    return {
      center: Constants.CHIMNEY_WIDTH_SMALL / 2,
      y: Constants.CHIMNEY_Y_SMALL,
      x: this.x + 35
    };
  }
};
