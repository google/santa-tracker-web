goog.provide('app.Fan');

goog.require('app.Constants');
goog.require('app.FanStateManager');

/**
 * Manages changes in fan speed.
 *
 * @param {Element} context DOM element that wraps the fan.
 * @param {app.FanStateManager} stateManager The fan state object.
 * @constructor
 */
app.Fan = function(context, stateManager) {
  this.context_ = $(context);

  this.threadsElem = this.context_.find('.threads');
  this.indicatorElem = this.context_.find('.indicator');
  this.leverFrameElem = this.context_.find('.lever-wrap');
  this.leverElem = this.context_.find('.lever');

  this.fanStateManager_ = stateManager;

  this.onLeverClicked_ = this.onLeverClicked_.bind(this);
};

/**
 * Initializes the fan.
 */
app.Fan.prototype.init = function() {
  this.addEventListeners_();
};


/**
 * Removes event listeners and other cleanup.
 */
app.Fan.prototype.destroy = function() {
  this.removeEventListeners_();
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Fan.prototype.addEventListeners_ = function() {
  this.leverFrameElem.on('click', this.onLeverClicked_);
};

/**
 * Un-binds event listeners.
 *
 * @private
 */
app.Fan.prototype.removeEventListeners_ = function() {
  this.leverFrameElem.off('click', this.onLeverClicked_);
};

/**
 * Cycles through fan speeds when lever is clicked.
 *
 * @private
 */
app.Fan.prototype.onLeverClicked_ = function() {
  this.fanStateManager_.cycleState();
  this.updateLeverAngle_();
  this.updateIndicatorPosition_();
  setTimeout(function() {
    this.updateThreads_();
  }.bind(this), app.Constants.FAN_SPEED_CHANGE_DELAY_MS);
};

/**
 * Set angle of lever based on current fan state.
 *
 * @private
 */
app.Fan.prototype.updateLeverAngle_ = function() {
  var angle = this.fanStateManager_.getLeverAngle();
  this.leverElem.css('transform', 'rotateZ(' + angle + 'deg)');
};

/**
 * Sets the speed indicator based on current fan state.
 *
 * @private
 */
app.Fan.prototype.updateIndicatorPosition_ = function() {
  var offset = this.fanStateManager_.getIndicatorOffset();
  this.indicatorElem.css('transform', 'translateX(' + offset + 'px)');
};

/**
 * Sets the class on threads based on current fan state.
 *
 * @private
 */
app.Fan.prototype.updateThreads_ = function() {
  var threadsClass = this.fanStateManager_.getThreadsClass();
  var threads = this.threadsElem.find('.thread');
  threads.removeClass().addClass('thread ' + threadsClass);
};

