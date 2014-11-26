goog.provide('app.Clock');

goog.require('app.Constants');


/**
 *
 * Clock class for handling an individual clock animation.
 *
 * @author  14islands (14islands.com)
 * @param {Object} context Module context in a HTML element
 * @constructor
 */
app.Clock = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$secondsPointer = this.$context_.find('.js-clock-pointer-seconds');
  this.$minutesPointer = this.$context_.find('.js-clock-pointer-minutes');
  this.$hourPointer = this.$context_.find('.js-clock-pointer-hour');
};

/**
 * Initializes the class.
 */
app.Clock.prototype.init = function() {
  this.addEventListeners_();
  this.startSpinSeconds_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Clock.prototype.destroy = function() {
  this.removeEventListeners_();
  this.stopSpinSeconds_();
};

/**
 * Binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onClockClick_.bind(this));
};

/**
 * Un-binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onClockClick_.bind(this));
};

/**
 * Animates the hour, seconds and minutes pointer in the clock.
 * @private
 */
app.Clock.prototype.spinPointers_ = function() {

  var _this = this;

  this.stopSpinSeconds_();

  TweenMax.to(
    this.$secondsPointer,
    2,
    {
      rotation: '+=1460',
      ease: Power4.easeOut,
      onComplete: _this.startSpinSeconds_.bind(_this)
    }
  );

  TweenMax.to(
    this.$hourPointer,
    0.5,
    {
      rotation: '+=30',
      ease: Power4.easeOut
    }
  );

  TweenMax.to(
    this.$minutesPointer,
    1,
    {
      rotation: '+=390',
      ease: Power4.easeOut
    }
  );

};

/**
 * Stops the tween for the seconds on the clock.
 * @private
 */
app.Clock.prototype.stopSpinSeconds_ = function() {
  TweenMax.killTweensOf(this.$secondsPointer);
};

/**
 * Starts the tween for the seconds on the clock.
 * @private
 */
app.Clock.prototype.startSpinSeconds_ = function() {
  TweenMax.to(
    this.$secondsPointer,
    60,
    {
      rotation: '+=360',
      repeat: -1,
      ease: Linear.easeOut
    }
  );
};

/**
 * Callback for when a clock is actually clicked.
 * @private
 */
app.Clock.prototype.onClockClick_ = function() {
  this.spinPointers_();
};

