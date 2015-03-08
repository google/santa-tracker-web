goog.provide('app.Spectator');

goog.require('app.Constants');


/**
 * Class responsible for taking care of a spectator (character).
 * This class handles any spectator interaction.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 */
app.Spectator = function(context) {
  this.$context_ = $(context);
  this.$group = this.$context_.find('.js-spectator-group');
  this.context_ = this.$context_[0];

  this.onSpectatorClick_ = this.onSpectatorClick_.bind(this);
};

/**
 * Initializes the class.
 */
app.Spectator.prototype.init = function() {
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Spectator.prototype.destroy = function() {
  this.removeEventListeners_();
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Spectator.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onSpectatorClick_);
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Spectator.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onSpectatorClick_);
};

/**
 * Shakes the spectator by moving its grouping element.
 *
 * @private
 */
app.Spectator.prototype.tweenShakeChair_ = function() {

  var el = this.$group.get(0);

  var steps = [
    {transform: 'translate(0)'},
    {transform: 'translate(+10px)', offset: 0.25},
    {transform: 'translate(-10px)', offset: 0.75},
    {transform: 'translate(0)'}
  ];

  el.animate(steps, { duration: 600, easing: 'ease-in-out' });

};

/**
 * Callback for when a spectator on its chair is clicked.
 */
app.Spectator.prototype.onSpectatorClick_ = function() {
  this.tweenShakeChair_();
};

