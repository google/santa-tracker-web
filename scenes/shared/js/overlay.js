goog.provide('app.shared.Overlay');

goog.require('app.shared.utils');

/**
 * Overlay.
 * @param {!HTMLElement} elem The overlay element.
 * @constructor
 */
app.shared.Overlay = function(elem) {
  this.elem = $(elem);
}

/**
 * Shows the overlay with an animation from the game.
 */
app.shared.Overlay.prototype.show = function() {
  this.elem.addClass('is-visible');
};

/**
 * Hides the overlay with an animation.
 * @param {!Function} callback Runs when the animation is finished.
 */
app.shared.Overlay.prototype.hide = function(callback) {
  this.elem.one(app.shared.utils.ANIMATION_END, function() {
    this.elem.removeClass('is-visible is-closed');
    callback && callback();
  }.bind(this)).addClass('is-closed');
};
