goog.provide('app.SleighScreen');

goog.require('app.Constants');
goog.require('app.shared.utils');



/**
 * Main SleighScreen class
 * @param {!Element} elem a DOM element context for the screen
 * @constructor
 */
app.SleighScreen = function(elem) {
  this.$el = $(elem);
  this.$shimmerEl = this.$el.find('.js-shimmer');
  this.$hammerArm = this.$el.find('.js-hammer-arm');
  this.$lift = this.$el.find('.js-lift');
  this.isActive = false;

  this.timeoutShimmer = undefined;
  this.hammerTimeout = undefined;

  this.onTimeToShimmer_ = this.onTimeToShimmer_.bind(this);
  this.scheduleShimmerAnimation_ = this.scheduleShimmerAnimation_.bind(this);
  this.runHammerAnimation_ = this.runHammerAnimation_.bind(this);
  this.onHammerAnimationEnd_ = this.onHammerAnimationEnd_.bind(this);
};

app.SleighScreen.prototype = {

  /**
   * @private
   */
  getRandomDelay_: function(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  /**
   * @private
   */
  getRandomShimmerDelay_: function() {
    return this.getRandomDelay_(app.Constants.SLEIGH_SHIMMER_DELAY_MAX,
        app.Constants.SLEIGH_SHIMMER_DELAY_MIN);
  },

  /**
   * @private
   */
  getRandomHammerDelay_: function() {
    return this.getRandomDelay_(app.Constants.SLEIGH_HAMMER_DELAY_MAX,
        app.Constants.SLEIGH_HAMMER_DELAY_MIN);
  },

  /**
   * @private
   */
  onTimeToShimmer_: function() {
    app.shared.utils.animWithClass(this.$shimmerEl, 'run-animation',
        this.scheduleShimmerAnimation_);
  },

  /**
   * @private
   */
  scheduleShimmerAnimation_: function() {
    if (this.isActive) {
      var randomDelay = this.getRandomShimmerDelay_();
      this.timeoutShimmer = window.setTimeout(this.onTimeToShimmer_, randomDelay);
    }
  },

  /**
   * @private
   */
  runHammerAnimation_: function() {
    if (this.isActive) {
      app.shared.utils.animWithClass(this.$hammerArm, 'run-animation',
          this.onHammerAnimationEnd_);
    }
  },

  /**
   * @private
   */
  onHammerAnimationEnd_: function() {
    if (this.isActive) {
      window.santaApp.fire('sound-trigger', 'command_hammer');
      var randomDelay = this.getRandomHammerDelay_();
      this.hammerTimeout = window.setTimeout(this.runHammerAnimation_, randomDelay);
    }
  },

  /**
   * Tell screen that it is visible
   */
  onActive: function() {
    this.startTime = Date.now();
    this.isActive = true;
    this.scheduleShimmerAnimation_();
    this.runHammerAnimation_();
  },

  /**
   * Tell screen that it is hidden
   */
  onInactive: function() {
    this.isActive = false;
    window.clearTimeout(this.timeoutShimmer);
    window.clearTimeout(this.hammerTimeout);
    this.$hammerArm.off();
  }

};
