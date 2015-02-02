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
  this.$context_.on('click', this.onSpectatorClick.bind(this));
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Spectator.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onSpectatorClick.bind(this));
};

/**
 * Shakes the spectator by moving its grouping element with a custom easing.
 *
 * @private
 */
app.Spectator.prototype.tweenShakeChair_ = function() {

  TweenMax.set(this.$group,
    {
      transformOrign: '50% 100%'
    }
  );

  TweenLite.fromTo(this.$group, 0.6,
    {
      x: -1
    },
    {
      x: 1,
      ease: RoughEase.ease.config(
        {
          strength: 20,
          points: 5,
          template: Power4.easeOut,
          randomize: false
        }
      ),
      clearProps: 'x'
    }
  );

};

/**
 * Callback for when a spectator on its chair is clicked.
 */
app.Spectator.prototype.onSpectatorClick = function() {
  this.tweenShakeChair_();
};

