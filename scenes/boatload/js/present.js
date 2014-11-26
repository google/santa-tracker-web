goog.provide('Present');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Drops a present.
 * @constructor
 * @param {Game} game The current game object.
 */
Present = function(game) {
  this.game = game;
  this.elem = $('<div class="present hidden"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="26.966px" height="30.337px" viewBox="0 0 26.966 30.337" enable-background="new 0 0 26.966 30.337" xml:space="preserve">' +
              '<rect x="5.098" y="7.098" width="15.123" height="15.122"/>' +
              '<polygon points="13.511,15.543 20.22,15.543 20.22,13.516 13.511,13.516 13.511,7.098 11.483,7.098 11.483,13.516 5.099,13.516 5.099,15.543 11.483,15.543 11.483,22.22 13.511,22.22 "/>' +
              '</svg></div>');

  var type = Math.ceil(Math.random() * 3);
  this.elem.addClass('present--' + type);
  this.game.presentsElem.append(this.elem);
}

/**
 * Create pool for presents.
 */
pools.mixin(Present);

/**
 * Resets the present for reuse.
 * @param {Number} y The Y position.
 */
Present.prototype.onInit = function(y) {
  this.elem.removeClass('hidden');
  this.dead = false;

  // State
  this.x = Constants.PRESENT_START_X;
  this.y = y;
  this.addX = 0;
  this.velocity = Constants.PRESENT_INITIAL_VELOCITY;
  this.scale = 1;
  this.draw();
};

/**
 * Remove the present from the game loop and hide it.
 */
Present.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Animate present when it misses.
 */
Present.prototype.missed = function() {
  this.dead = true;
  Coordinator.step(0.6, function(progress) {
    this.addX = progress * 20;
    this.draw();
  }.bind(this), function() {
    this.remove();
    this.game.lastMissedPresent = null;
  }.bind(this));
  utils.animWithClass(this.elem, 'present--missed');
};

/**
 * Draw the present.
 */
Present.prototype.draw = function() {
  this.elem
      .css('transform',
          'translate(' + (this.x + this.addX) + 'px, ' + this.y + 'px) ' +
          'scale(' + this.scale + ') translateZ(0)');
};

/**
 * Moves the present each frame.
 * @param  {number} delta Time since last frame.
 */
Present.prototype.onFrame = function(delta) {
  if (this.x >= Constants.PRESENT_END_X) {
    this.game.missedBoat(this, this.x - Present.PRESENT_CENTER, this.y - Present.PRESENT_CENTER);
    return;
  }

  // Move present to the end
  this.x += this.velocity * delta;
  if (this.x > Constants.PRESENT_END_X) {
    this.x = Constants.PRESENT_END_X;
  }

  // Collition detection
  for (var i = 0, len = this.game.entities.length; i < len; i++) {
    if (!this.game.entities[i].getHitbox) {
      continue;
    }
    this.checkCollition_(this.game.entities[i]);
  }
  var distance = (this.x - Constants.PRESENT_START_X) /
      (Constants.PRESENT_END_X - Constants.PRESENT_START_X);
  this.scale = 1.5 - Math.abs(distance - .5);
  this.draw();
};

/**
 * Collition detection.
 * @param  {Object} entity The entity to check for collition.
 * @private
 */
Present.prototype.checkCollition_ = function(entity) {
  var hitbox = entity.getHitbox();

  // Check vertical hit
  if (hitbox.x < this.x || hitbox.x >= this.x + 30 /* width */) {
    return;
  }

  // Check for horizontal hit
  if (Math.abs(this.y - hitbox.y - hitbox.center) <=
      hitbox.center - Present.PRESENT_CENTER + 20 /* edges */) {
    // Entity hit
    entity.hit(this, this.x + Present.PRESENT_CENTER, this.y + Present.PRESENT_CENTER);
  }
};

/** @const */
Present.PRESENT_CENTER = Constants.PRESENT_WIDTH / 2;
