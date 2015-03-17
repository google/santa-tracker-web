goog.provide('app.Collision');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.pools');

/**
 * Creates a collision cloud.
 * @constructor
 * @param {Game} game The current game object.
 */
app.Collision = function(game) {
  app.Entity.call(this);

  this.game = game;
  this.elem = $('<div class="collision hidden" />');
  this.animationElem = $('<div class="hit-cloud" />');
  this.animationElem.appendTo(this.elem);

  game.collisionsElem.append(this.elem);
};

/**
 * Inherit from entity.
 */
app.Collision.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Collision);

/**
 * Resets the collision for reuse.
 * @param {number} x screen position.
 * @param {number} y screen position.
 */
app.Collision.prototype.onInit = function(x, y) {
  var self = this;
  this.elem.removeClass('hidden');
  this.setPos(x + 5, y + 2);
  this.elem.css('transform', 'translate3d(' + this.x + 'em, ' + this.y + 'em, 0)');
  this.animationElem.addClass('active');
  this.animationElem.off();
  this.animationElem.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function() {
    self.animationElem.removeClass('active');
    self.remove();
  });

  this.dead = false;
};

/**
 * Remove present from pool.
 */
app.Collision.prototype.remove = function() {
  app.Collision.push(this);
};

/**
 * Remove the present from the dom and game loop.
 */
app.Collision.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Virtual method to update collision for new frame.
 */
app.Collision.prototype.onFrame = function() {};
