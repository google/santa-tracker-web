goog.require('app.Constants');
goog.require('app.PresentPool');

goog.provide('app.PresentsBelt');



/**
 * Class for belt with presents dropping of the edge
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} domEl DOM element containing the belt
 * @param {Object} options Configuration options for the belt
 * @constructor
 */
app.PresentsBelt = function(domEl, options) {
  this.$el = $(domEl);
  this.options = options || {};
  this.options.timeOffset = this.options.timeOffset ? this.options.timeOffset : 0;
  this.options.direction = this.options.direction ? this.options.direction : 'ltr';
  this.$presentEls = this.$el.find('.presents-screen__belt__present');

  this.distance_ = this.$el.width();
  this.dx_ = app.Constants.PRESENTS_BELT_DURATION / this.distance_;

  this.presentPool = new app.PresentPool(this.$presentEls);

  this.init_();
};

app.PresentsBelt.prototype = {

  /**
   * Callback when present is added to timeline
   * @private
   */
  onEnterBelt_: function(present) {
    present.onEnterBelt();
    // add next present unless first setup
    if (!this.setup) {
      this.addItem_();
    }
  },

  /**
   * Callback when present reaches end of timeline
   * @private
   */
  onExitBelt_: function(present, tweenReferences) {
    var i,
        l = tweenReferences.length;

    for (i = 0; i < l; i++) {
      this.timeline.remove(tweenReferences[i]);
    }

    present.onExitBelt();
  },

  /**
   * Return length of present (including margin to next present) as duration of seconds
   * @private
   * @return {Number}
   */
  itemWidthAsSeconds_: function(present) {
    return this.dx_ * present.outerWidth();
  },

  /**
   * Generate a random rotation angle based on app constants min/max
   * @private
   * @return {Number}
   */
  getRandomDropRotation_: function() {
    var c = app.Constants;
    var max = c.PRESENTS_DROP_ROTATION_MAX - c.PRESENTS_DROP_ROTATION_MIN + 1;
    var min = c.PRESENTS_DROP_ROTATION_MIN;
    return Math.floor(Math.random() * max + min);
  },

  /**
   * Schedule present tweens on the timeline
   * @private
   */
  scheduleItem_: function(present, startTime) {
    var tweenReferences = [],
        startCallback,
        beltTween,
        rotationTween,
        dropTween;

    var directionMultiplier = this.options.direction === 'ltr' ? -1 : 1;
    var directionPrefix = directionMultiplier < 0 ? '+=' : '-=';
    var presentMidpoint = directionMultiplier * present.width() * 0.5;
    var dropRotation = this.getRandomDropRotation_();

    var rotationTime = startTime + app.Constants.PRESENTS_BELT_DURATION;
    var dropTime = rotationTime + app.Constants.PRESENTS_ROTATION_DURATION;

    startCallback = TweenLite.delayedCall(0, this.onEnterBelt_, [present], this);

    // horizontal tween on belt
    beltTween = TweenLite.fromTo(
        present.$el,
        app.Constants.PRESENTS_BELT_DURATION,
        {
          x: 0,
          y: 0,
          rotation: 0
        },
        {
          css: {
            x: directionPrefix + (this.distance_ + presentMidpoint),
            force3D: true
          },
          ease: Linear.easeNone
        }
        );

    // rotating over belt end
    rotationTween = TweenLite.to(present.$el, app.Constants.PRESENTS_ROTATION_DURATION, {
      css: {
        rotation: directionPrefix + 35,
        force3D: true
      },
      onComplete: function() {
        window.santaApp.fire('sound-trigger', 'command_presentdrop');
      },
      ease: Linear.easeNone
    });

    // dropping into sack
    dropTween = TweenLite.to(present.$el, app.Constants.PRESENTS_DROP_DURATION, {
      css: {
        x: directionPrefix + 90,
        y: '+=100',
        rotation: directionPrefix + dropRotation,
        force3D: true
      },
      ease: Sine.easeIn,
      onComplete: this.onExitBelt_.bind(this),
      onCompleteParams: [present, tweenReferences]
    });

    this.timeline.add(startCallback, startTime);
    this.timeline.add(beltTween, startTime);
    this.timeline.add(rotationTween, rotationTime);
    this.timeline.add(dropTween, dropTime);

    tweenReferences.push(startCallback);
    tweenReferences.push(beltTween);
    tweenReferences.push(rotationTween);
    tweenReferences.push(dropTween);
  },

  /**
   * Add a Present to animate across the belt
   * @private
   * @return {Present}
   */
  addItem_: function(startTime) {
    var startTime = startTime || this.timeline.time();

    var present = this.presentPool.getFreeItem();
    if (present) {
      startTime += this.itemWidthAsSeconds_(present); // delay based on width of present
      this.scheduleItem_(present, startTime);
    }
    else {
      // pool size and margin between items must be set so we dont run out of items in the pool
      console.log('NO FREE present IN POOL');
    }

    return present;
  },

  /**
   * Setup belt on load
   * @private
   */
  init_: function() {
    this.timeline = new TimelineMax();
    this.timeline.stop();

    this.setup = true;
    var seekTime = 1;
    for (var j = 0; j < app.Constants.PRESENTS_PRELOAD_AMOUNT; j++) {
      var present = this.addItem_(seekTime);
      seekTime += this.itemWidthAsSeconds_(present);
    }

    // start 1 second before to be sure we trigger callbacks for last present
    this.timeline.seek(seekTime - 1 + this.options.timeOffset, false);
    this.setup = false;
    this.timeline.play();
  },

  /**
   * Destroy belt and all scheduled animations
   * @public
   */
  destroy: function() {
    this.timeline.kill();
    this.timeline.remove();
    this.presentPool = null;
  }

};
