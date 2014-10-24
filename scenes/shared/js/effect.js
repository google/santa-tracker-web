/**
 * Creates some effect using css animations.
 * Adds animate class to element to activate animation.
 * @constructor
 * @param {Game} game The current game object.
 * @param {HTMLElement} elem The element for the effect.
 * @param {Function} callback Called when animation is over.
 */
function Effect(game, elem, callback) {
  this.game = game;
  this.elem = elem;
  this.callback = callback;

  this.animateEnded_ = this.animateEnded_.bind(this);
};

/**
 * Animate the effect at a position.
 * @param  {Number} x The X position.
 * @param  {Number} y The Y position.
 */
Effect.prototype.animate = function(x, y) {
  // Position
  this.elem.css({
    left: x,
    top: y
  }).removeClass('hidden');

  // Animate
  utils.animWithClass(this.elem, 'animate', this.animateEnded_, true);
};

/**
 * Hide effect when animation has finished.
 * @private
 */
Effect.prototype.animateEnded_ = function() {
  this.elem.addClass('hidden');
  if (this.callback) {
    this.callback.call(this);
  }
};
