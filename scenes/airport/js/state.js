goog.require('app.Constants');

goog.provide('app.State');

/**
 * Class for keeping the scene state
 * @param {Number} beltLength Length of belt in pixels
 * @constructor
 */
app.State = function(beltLength) {
  this.dx_ = app.Constants.DURATION / beltLength;
  this.currentState_ = app.Constants.STATE_NORMAL;
  this.previousState_ = -1;
  this.stateCycle_ = [
    app.Constants.STATE_NORMAL,
    app.Constants.STATE_MEDIUM,
    app.Constants.STATE_FAST
  ];
};

app.State.prototype = {

  /**
   * @private
   */
  setState_: function(state) {
    this.previousState_ = this.currentState_;
    this.currentState_ = state;
    $(this).trigger('change', this.currentState_);
  },

  /**
   * @public
   * @return {Number} pixels per second
   */
  dx: function() {
    return this.dx_;
  },

  /**
   * @public
   * @return {Number} Timescale to use for running animations
   */
  timeScale: function() {
    if (this.isMediumState()) {
      return app.Constants.TIMESCALE_MEDIUM;
    }
    else if (this.isFastState()) {
     return app.Constants.TIMESCALE_FAST;
    }
    return app.Constants.TIMESCALE_NORMAL;
  },

  /**
   * @public
   * @return {String} CSS class name for current state
   */
  className: function() {
    if (this.isMediumState()) {
      return app.Constants.CLASS_SPEED_MEDIUM;
    }
    else if (this.isFastState()) {
     return app.Constants.CLASS_SPEED_FAST;
    }
    return app.Constants.CLASS_SPEED_NORMAL;
  },

  soundEventName: function() {
    if (this.isMediumState()) {
      return 'airport_conveyor_speed_2';
    }
    else if (this.isFastState()) {
     return 'airport_conveyor_speed_3';
    }
    return 'airport_conveyor_speed_1';
  },

  /**
   * @public
   * @return {Boolean}
   */
  isNormalState: function() {
    return this.currentState_ === app.Constants.STATE_NORMAL;
  },

  /**
   * @public
   * @return {Boolean}
   */
  isMediumState: function() {
    return this.currentState_ === app.Constants.STATE_MEDIUM;
  },

  /**
   * @public
   * @return {Boolean}
   */
  isFastState: function() {
    return this.currentState_ === app.Constants.STATE_FAST;
  },

  /**
   * @public
   */
  cycleState: function() {
    var direction = this.currentState_ - this.previousState_;
    if (this.isFastState()) {
      this.previousState();
    }
    else if (this.isNormalState()) {
      this.nextState();
    }
    else if (direction < 0) {
      this.previousState();
    }
    else if (direction > 0) {
      this.nextState();
    }
  },

  /**
   * @public
   */
  nextState: function() {
    var nextState = this.stateCycle_[this.currentState_ + 1 % this.stateCycle_.length];
    if (nextState > this.currentState_) {
      this.setState_(nextState);
    }
  },

  /**
   * @public
   */
  previousState: function() {
    var previousState = this.stateCycle_[this.currentState_ - 1 % this.stateCycle_.length];
    if (previousState < this.currentState_) {
      this.setState_(previousState);
    }
  }
};
