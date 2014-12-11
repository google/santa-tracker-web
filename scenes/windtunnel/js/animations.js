goog.provide('app.Animations');

goog.require('app.Constants');

/**
 * Class to manage animations.
 *
 * @constructor
 */
app.Animations = function() {
  this.fanStateMap_ = {};
  this.fanStateMap_[app.Constants.FAN_STATE_LOW] = {
    beginAngle: -25,
    endAngle: -35,
    backgroundDuration: 12
  };
  this.fanStateMap_[app.Constants.FAN_STATE_MED] = {
    beginAngle: -10,
    endAngle: -20,
    backgroundDuration: 9
  };
  this.fanStateMap_[app.Constants.FAN_STATE_HIGH] = {
    beginAngle: 5,
    endAngle: -5,
    backgroundDuration: 4
  };
};

/**
 * @param  {Element} element  The animation target element.
 * @param  {number} fanState The fan state.
 * @param  {number} duration The animation duration in milliseconds.
 * @return {AnimationSequence} The animation for the given element and fan state.
 */
app.Animations.prototype.getParachuteAnimation = function(element, fanState,
    duration) {
  var currentAngle = this.getRotation_(element);
  var beginAngle = this.fanStateMap_[fanState].beginAngle;
  var endAngle = this.fanStateMap_[fanState].endAngle;

  var initialTransition = new Animation(element[0], [
      {transform: 'rotateZ(' + currentAngle + 'deg)'},
      {transform: 'rotateZ(' + beginAngle + 'deg)'}
    ], 500 * Math.abs(beginAngle - currentAngle) / 20.0);

  var timing = {
    direction: 'alternate',
    duration: duration,
    easing: 'ease-in-out',
    iterations: Infinity
  };

  var animation = new Animation(element[0], [
      {transform: 'rotateZ(' + beginAngle + 'deg)'},
      {transform: 'rotateZ(' + endAngle + 'deg)'}
    ], timing);

  return new AnimationSequence([initialTransition, animation]);
};

/**
 * @param  {Element} element  The animation target element.
 * @param  {number} fanState The fan state.
 * @return {AnimationSequence} The animation for the given element and fan state.
 */
app.Animations.prototype.getBackgroundAnimation = function(element, fanState) {
  var currentOffset = this.getOffset_(element);
  var endOffset = -app.Constants.SCREEN_BACKGROUND_WIDTH;
  var duration = this.fanStateMap_[fanState].backgroundDuration;

  var initialTransition = new Animation(element[0], [
      {transform: 'translateX(' + currentOffset + ')'},
      {transform: 'translateX(' + endOffset + 'px)'}
    ], (duration * 1000) * ((endOffset - currentOffset) / endOffset));

  var animation = new Animation(element[0], [
      {transform: 'translateX(0)'},
      {transform: 'translateX(' + endOffset + 'px)'}
    ], {
      duration: duration * 1000,
      iterations: Infinity
    });

  return new AnimationSequence([initialTransition, animation]);
};

/**
 * @param  {Element} element The element to get the rotation of.
 * @return {number} The rotation angle of the given element in degrees.
 *
 * @private
 */
app.Animations.prototype.getRotation_ = function(element) {
  var values = this.getTransformMatrixValues_(element);
  if (values) {
    return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
  }

  return 0;
};

/**
 * @param  {Element} element The element to get the X offset of.
 * @return {number} The offset of the given element.
 *
 * @private
 */
app.Animations.prototype.getOffset_ = function(element) {
  var values = this.getTransformMatrixValues_(element);
  if (values) {
    return values[4];
  }

  return 0;
};

/**
 * @param  {Element} element The element to get the transform matrix of.
 * @return {Array} Array of values from the transform matrix.
 *
 * @private
 */
app.Animations.prototype.getTransformMatrixValues_ = function(element) {
  var matrixString = element.css('transform');

  if (matrixString && matrixString !== 'none') {
    return matrixString.split('(')[1].split(')')[0].split(',');
  }
};
