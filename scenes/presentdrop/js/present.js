goog.provide('Present');

goog.require('app.shared.pools');

/**
 * Drops a present.
 * @constructor
 * @param {Game} game The current game object.
 */
Present = function(game) {
  this.game = game;
  this.elem = $('<div class="present hidden" />');
  game.presentsElem.append(this.elem);
};

app.shared.pools.mixin(Present);

/**
 * Resets the present for reuse.
 * @param {number} x The X position.
 */
Present.prototype.onInit = function(x) {
  this.elem.removeClass('hidden');
  this.dead = false;

  // State
  this.x = x - Present.PRESENT_CENTER;
  this.y = Constants.PRESENT_START_Y;
  this.velocity = Constants.PRESENT_INITIAL_VELOCITY;
  this.elem.css('left', this.x + 'px');
  this.draw();
};

/**
 * Remove present from pool.
 */
Present.prototype.remove = function() {
  Present.push(this);
};

/**
 * Remove the present from the dom and game loop.
 */
Present.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Position the present.
 */
Present.prototype.draw = function() {
  this.elem.css('top', this.y + 'px');
};

/**
 * Moves the present each frame.
 * @param  {number} delta Time since last frame.
 */
Present.prototype.onFrame = function(delta) {
  var lasty = this.y, present = this;

  // Calculate gravity
  if (this.y < Constants.PRESENT_END_Y) {
    this.velocity += Constants.PRESENT_GRAVITY * delta;
    this.y += this.velocity * delta;
    if (this.y > Constants.PRESENT_END_Y) {
      this.y = Constants.PRESENT_END_Y;
    }
  } else {
    present.remove();
    window.santaApp.fire('sound-trigger', 'pd_item_miss');
  }

  // Collition detection
  this.game.forEachActiveChimney(function(chimney) {
    var hitbox = chimney.getHitbox();

    // Check vertical hit
    if (hitbox.y <= lasty || hitbox.y >= present.y) {
      return;
    }

    // Check for horizontal hit
    var diff = Math.abs(present.x - hitbox.x - hitbox.center);

    if (diff <= hitbox.center - Present.PRESENT_CENTER) {
      // Hits inside chimney.
      present.remove();
      chimney.hit();

    } else if (diff < hitbox.center + Present.PRESENT_CENTER) {
      // Hits on edge. Should bounce away?
      present.remove();
      chimney.hit();
    }
  });

  this.draw();
};

/**
 * Drop a present.
 * @param {number} x The x location of the present.
 */
Present.prototype.drop = function(x) {
  this.elem.addClass('drop');
  this.elem.css({left: (x - Present.PRESENT_CENTER) + 'px'});
  this.elem.appendTo(this.elem.closest('.stage').find('.presents'));
};

/** @const */
Present.PRESENT_CENTER = Constants.PRESENT_WIDTH / 2;
