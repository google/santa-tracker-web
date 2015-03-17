goog.provide('app.shared.PauseOverlay');

goog.require('app.shared.Overlay');



/**
 * Pause screen.
 * @param {!HTMLElement} elem The game element.
 * @constructor
 */
app.shared.PauseOverlay = function(elem) {
  this.overlay = new app.shared.Overlay($(elem));
};


/**
 * Shows the pause screen with an animation.
 */
app.shared.PauseOverlay.prototype.show = function() {
  this.overlay.show();
};


/**
 * Hides the pause screen with an animation.
 * @param {function} callback
 */
app.shared.PauseOverlay.prototype.hide = function(callback) {
  this.overlay.hide(callback);
};
