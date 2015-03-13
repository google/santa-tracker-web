goog.provide('app.Clock');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Clock class for handling an individual clock animation.
 *
 * @param {!Element} context Module context in a HTML element
 * @constructor
 */
app.Clock = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$secondsPointer = this.$context_.find('.js-clock-pointer-seconds');
  this.$minutesPointer = this.$context_.find('.js-clock-pointer-minutes');
  this.$hourPointer = this.$context_.find('.js-clock-pointer-hour');

  this.onClockClick_ = this.onClockClick_.bind(this);

  this.secondsPlayer_ = (function(el) {
    var steps = [
      {transform: 'rotate(0deg)'},
      {transform: 'rotate(360deg)'}
    ];
    return el.animate(steps, {duration: 60 * 1000, iterations: Infinity});
  }(this.$secondsPointer.get(0)));
};

/**
 * Finds the current rotation value of an element, in degrees.
 *
 * Source: https://css-tricks.com/get-value-of-css-rotation-through-javascript/
 *
 * @param {!Element} element to find rotation of
 * @return {number} rotation of the current element
 */
app.Clock.prototype.getRotateForElement_ = function(element) {
  var style = window.getComputedStyle(element);
  var transform;

  ['-webkit-', '-moz-', '-ms-', '-o-', ''].some(function(prefix) {
    var t = style.getPropertyValue(prefix + 'transform');
    if (!t) { return false; }
    transform = t;
    return true;
  });

  var values;
  try {
    values = transform.split('(')[1].split(')')[0].split(',');
  } catch(e) {
    return 0;
  }
  var a = values[0];
  var b = values[1];

  var scale = Math.sqrt(a*a + b*b);

  // arc sin, convert from radians to degrees, round
  var sin = b / scale;
  // next line works for 30deg but not 130deg (returns 50);
  return Math.atan2(b, a) * (180 / Math.PI);
};

/**
 * Initializes the class.
 */
app.Clock.prototype.init = function() {
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Clock.prototype.destroy = function() {
  this.removeEventListeners_();
  this.secondsPlayer_.cancel();
};

/**
 * Binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onClockClick_);
};

/**
 * Un-binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onClockClick_);
};

/**
 * Animates the hour, seconds and minutes pointer in the clock.
 * @private
 */
app.Clock.prototype.spinPointers_ = function() {

  var secondsEl = this.$secondsPointer.get(0);
  var secondsRotate = Math.round(this.getRotateForElement_(secondsEl));
  secondsEl.animate([
    {transform: 'rotate(' + secondsRotate + 'deg)'},
    {transform: 'rotate(' + (secondsRotate + (360 * 2.5)) + 'deg)'}
  ], {duration: 1250, easing: 'ease-out'});

  // Offset the background animation by the interactive animation's length: at
  // 1.25 seconds back (animation time) plus 30 seconds (half offset).
  this.secondsPlayer_.currentTime += (-1.25 + 30) * 1000;

  var sharedTiming = {duration: 500, easing: 'ease-out'};

  var hourEl = this.$hourPointer.get(0);
  var hourRotate = Math.round(this.getRotateForElement_(hourEl));
  var hourFinal = 'rotate(' + (hourRotate + 30) + 'deg)';
  var hourAnim = hourEl.animate([
    {transform: 'rotate(' + hourRotate + 'deg)'},
    {transform: hourFinal}
  ], sharedTiming);
  app.shared.utils.onWebAnimationFinished(hourAnim, function() {
    hourEl.style.webkitTransform = hourFinal;
    hourEl.style.transform = hourFinal;
  });

  var minutesEl = this.$minutesPointer.get(0);
  var minutesRotate = Math.round(this.getRotateForElement_(minutesEl));
  var minutesFinal = 'rotate(' + (minutesRotate + 390) + 'deg)';
  var minutesAnim = minutesEl.animate([
    {transform: 'rotate(' + minutesRotate + 'deg)'},
    {transform: minutesFinal}
  ], sharedTiming);
  app.shared.utils.onWebAnimationFinished(minutesAnim, function() {
    minutesEl.style.webkitTransform = minutesFinal;
    minutesEl.style.transform = minutesFinal;
  });

};

/**
 * Callback for when a clock is actually clicked.
 * @private
 */
app.Clock.prototype.onClockClick_ = function() {
  this.spinPointers_();
};

