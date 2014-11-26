goog.provide('app.Sleepy');

goog.require('app.Constants');

/**
 *
 * Sleepy class responsible for the sleepy elements (elves).
 *
 * @param {Element} context An DOM element which wraps the scene.
 * @param {Object} delayPool reference to the delayPool.
 * @param {Object} sleepyController reference to the sleepy controller.
 * @constructor
 * @author  14islands (14islands.com)
 */
app.Sleepy = function(context, delayPool, sleepyController) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$head = this.$context_.find('.js-spectator-head');
  this.$headVerticalStep1 = this.$context_.find('.js-spectator-head-vertical-1');
  this.$headVerticalStep2 = this.$context_.find('.js-spectator-head-vertical-2');
  this.$headVerticalFinal = this.$context_.find('.js-spectator-head-vertical-3');
  this.$letters = this.$context_.find('.js-letters');
  this.CSS_SLEEPING_CLASS = 'is-sleeping';
  this.CSS_BOUNCING_CLASS = 'is-bouncing';
  this.isSleeping = false;
  this.sleepingTimer_ = -1;
  this.sleepingKeyframesTimer_ = -1;
  this.bouncingKeyframesTimer_ = -1;
  this.scheduleSleepingTimer_ = -1;
  this.headRotateZTimeline = null;
  this.headRotateYTimeline = null;
  this.sleepingMode = 1;
  this.delayPool = delayPool;
  this.sleepyController = sleepyController;
};

/**
 * Initializes the class.
 */
app.Sleepy.prototype.init = function() {
  this.scheduleSleep_();
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Sleepy.prototype.destroy = function() {
  this.removeEventListeners_();
  this.randomDelayPool = null;
  window.clearTimeout(this.sleepingKeyframesTimer_);
  window.clearTimeout(this.sleepingTimer_);
  window.clearTimeout(this.bouncingKeyframesTimer_);
  window.clearTimeout(this.scheduleSleepingTimer_);
  this.isSleeping = false;
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Sleepy.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onSleepyClick.bind(this));
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Sleepy.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onSleepyClick.bind(this));
};

/**
 * Sets a timeout to start sleeping.
 *
 * @private
 */
app.Sleepy.prototype.scheduleSleep_ = function() {
  var randomDelay = this.delayPool.getRandomDelay_();
  this.sleepingTimer_ = window.setTimeout(this.tryToSleep_.bind(this), randomDelay);
};

/**
 * Makes a character have the sleepy state.
 *
 * @private
 */
app.Sleepy.prototype.tryToSleep_ = function() {

  if (!this.sleepyController.canSleep()) {
    // try again
    this.scheduleSleep_();
    return;
  }

  this.setSleepingMode_();

  if (this.isSleepingVertically_()) {
    this.tweenRotateYHead_();
  } else {
    this.tweenRotateZHead_();
  }

  this.sleepingKeyframesTimer_ = window.setTimeout(this.startSleepingKeyframes_.bind(this), 50);
  this.isSleeping = true;
  this.sleepyController.addSleepy();

  window.santaApp.fire('sound-trigger', 'briefing_snore');
};

/**
 * Wakes up a character by reversing the sleeping (if possible)
 * and re-scheduling the next sleepy cycle.
 *
 * @private
 */
app.Sleepy.prototype.wakeUp_ = function() {

  this.stopSleepingKeyframes_();

  if (this.isSleepingVertically_() &&
    this.headRotateYTimeline !== null) {

    this.headRotateYTimeline
      .timeScale(3)
      .reverse();

  } else if (this.headRotateZTimeline !== null) {

    this.headRotateZTimeline
      .timeScale(5)
      .reverse();

  }

  window.santaApp.fire('sound-trigger', 'briefing_wakeup');

  window.clearTimeout(this.sleepingKeyframesTimer_);
  window.clearTimeout(this.sleepingTimer_);
  window.clearTimeout(this.bouncingKeyframesTimer_);
  this.isSleeping = false;
  this.sleepyController.subtractSleepy();
  this.scheduleSleepingTimer_ = window.setTimeout(this.scheduleSleep_.bind(this), 3000);
};

/**
 * Sleeping mode can be 0 or 1.
 *
 * @private
 */
app.Sleepy.prototype.setSleepingMode_ = function() {
  this.sleepingMode = Math.floor(Math.random() * 2);
};

/**
 * Checks if the character is supposed to be sleeping vertically.
 *
 * @return {Boolean} True or false for the sleepingMode
 * @private
 */
app.Sleepy.prototype.isSleepingVertically_ = function() {
  return this.sleepingMode === 1;
};

/**
 * Add CSS animation classes to the character
 * that visualises it's sleeping state.
 *
 * @private
 */
app.Sleepy.prototype.startSleepingKeyframes_ = function() {
  var _this = this;
  this.$letters.addClass(this.CSS_SLEEPING_CLASS);

  this.bouncingKeyframesTimer_ = window.setTimeout(function() {
    if (_this.isSleepingVertically_()) {
      _this.$headVerticalFinal
        .addClass(_this.CSS_BOUNCING_CLASS);
    } else {
      _this.$head
        .addClass(_this.CSS_BOUNCING_CLASS);
    }
  }, 3000);
};

/**
 * Removes CSS animation classes from the character
 * that visualises it's awaking state.
 *
 * @private
 */
app.Sleepy.prototype.stopSleepingKeyframes_ = function() {
  this.$letters.removeClass(this.CSS_SLEEPING_CLASS);
  this.$headVerticalFinal.removeClass(this.CSS_BOUNCING_CLASS);
  this.$head.removeClass(this.CSS_BOUNCING_CLASS);
};

/**
 * Performs a timeline of display steps
 * to show the head flipping backwards.
 *
 * @private
 */
app.Sleepy.prototype.tweenRotateYHead_ = function() {
  this.headRotateYTimeline = new TimelineMax();

  this.headRotateYTimeline
    .to(
      this.$head,
      0.07,
      {
        display: 'none'
      }
    );

  this.headRotateYTimeline
    .to(
      this.$headVerticalStep1,
      0.07,
      {
        display: 'block'
      }
    );

  this.headRotateYTimeline
    .to(
      this.$headVerticalStep1,
      0.07,
      {
        display: 'none'
      }
    );

  this.headRotateYTimeline
    .to(
      this.$headVerticalStep2,
      0.07,
      {
        display: 'block'
      }
    );

  this.headRotateYTimeline
    .to(
      this.$headVerticalStep2,
      0.07,
      {
        display: 'none'
      }
    );

  this.headRotateYTimeline
    .to(
      this.$headVerticalFinal,
      0.07,
      {
        display: 'block'
      }
    );
};

/**
 * Tweens the head rotating when not sleeping vertically.
 *
 * @private
 */
app.Sleepy.prototype.tweenRotateZHead_ = function() {
  this.headRotateZTimeline = new TimelineMax();

  this.headRotateZTimeline
    .set(
      this.$head,
      {
        transformOrigin: 'center bottom'
      }
    );

  this.headRotateZTimeline
    .fromTo(
      this.$head,
      2,
      {
        rotation: 0
      },
      {
        rotation: 70,
        ease: Circ.EaseOut
      }
    );

};

/**
 * Callback for when a chair clicked
 */
app.Sleepy.prototype.onSleepyClick = function() {
  if (this.isSleeping) {
    // give it some time to react to look more organic
    setTimeout(this.wakeUp_.bind(this), 200);
  }
};
