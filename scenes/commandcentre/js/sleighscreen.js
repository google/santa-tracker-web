goog.provide('app.SleighScreen');

goog.require('app.Constants');
goog.require('app.shared.utils');



/**
 * Main SleighScreen class
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} elem a DOM element context for the screen
 * @constructor
 */
app.SleighScreen = function(elem) {
  this.$el = $(elem);
  this.$shimmerEl = this.$el.find('.js-shimmer');
  this.$hammerArm = this.$el.find('.js-hammer-arm');
  this.$lift = this.$el.find('.js-lift');
  this.isActive = false;

  this.timeoutShimmer = undefined;

  this.onTimeToShimmer_ = this.onTimeToShimmer_.bind(this);
  this.scheduleShimmerAnimation_ = this.scheduleShimmerAnimation_.bind(this);
  this.runHammerAnimation_ = this.runHammerAnimation_.bind(this);
  this.onHammerAnimationEnd_ = this.onHammerAnimationEnd_.bind(this);
};

app.SleighScreen.prototype = {

  getRandomShimmerDelay_: function() {
    var max = (app.Constants.SLEIGH_SHIMMER_DELAY_MAX - app.Constants.SLEIGH_SHIMMER_DELAY_MIN + 1);
    var min = app.Constants.SLEIGH_SHIMMER_DELAY_MIN;
    return Math.floor(Math.random() * max + min);
  },

  getRandomHammerDelay_: function() {
    var max = (app.Constants.SLEIGH_HAMMER_DELAY_MAX - app.Constants.SLEIGH_HAMMER_DELAY_MIN + 1);
    var min = app.Constants.SLEIGH_HAMMER_DELAY_MIN;
    return Math.floor(Math.random() * max + min);
  },

  /**
   *
   * @private
   */
  onTimeToShimmer_: function() {
    app.shared.utils.animWithClass(this.$shimmerEl,
                                   'run-animation',
                                   this.scheduleShimmerAnimation_);
  },

  scheduleShimmerAnimation_: function() {
    if (this.isActive) {
      var randomDelay = this.getRandomShimmerDelay_();
      this.timeoutShimmer = setTimeout(this.onTimeToShimmer_, randomDelay);
    }
  },

  runHammerAnimation_: function() {
    if (this.isActive) {
      app.shared.utils.animWithClass(this.$hammerArm,
                                     'run-animation',
                                     this.onHammerAnimationEnd_);
    }
  },

  onHammerAnimationEnd_: function() {
    if (this.isActive) {
      window.santaApp.fire('sound-trigger', 'command_hammer');
      var randomDelay = this.getRandomHammerDelay_();
      this.hammerTimeout = setTimeout(this.runHammerAnimation_, randomDelay);
    }
  },

  /**
   * Tell screen that it is visible
   * @public
   */
  onActive: function() {
    this.startTime = Date.now();
    this.isActive = true;
    this.scheduleShimmerAnimation_();
    this.runHammerAnimation_();
  },

  /**
   * Tell screen that it is hidden
   * @public
   */
  onInactive: function() {
    this.isActive = false;
    clearTimeout(this.timeoutShimmer);
    clearTimeout(this.hammerTimeout);
    this.$hammerArm.off();
  }

};
