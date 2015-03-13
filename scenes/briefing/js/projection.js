goog.provide('app.Projection');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Briefing Projection class. Takes care of sliding the container to show a
 * projector image.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 */
app.Projection = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];

  this.currentSlide_ = 0;
  this.previousSlide_ = null;
  this.slidingTimer_ = -1;
  this.slideshowTimer_ = -1;
  this.movingWaterTimer = -1;

  this.CLASS_TOGGLED = 'is-toggled';
  this.CLASS_SLIDE_UP = 'run-slide-up';
  this.CLASS_SHOWERING = 'is-showering';

  this.isToggled = false;
  this.isAnimating = false;

  this.$handle = this.$context_.find('.js-projector-handle');
  this.$projectionGroup_ = this.$context_.find('.js-screen-group');
  this.$projectorBeamSquare = this.$context_.find('.js-projector-beam-square');
  this.$arrowLeft = this.$context_.find('.js-arrow-left');
  this.$arrowRight = this.$context_.find('.js-arrow-right');
  this.$projection = this.$context_.find('.js-projection');
  this.$clickHandler = this.$context_.find('.js-screen-click-handler');
  this.$waterDashHolder = this.$context_.find('.js-shower-water');

  this.prevSlide_ = this.prevSlide_.bind(this);
  this.nextSlide_ = this.nextSlide_.bind(this);
  this.onContextClick_ = this.onContextClick_.bind(this);

  this.projectionPlayer_ = (function(el) {
    var steps = [
      {transform: 'translateY(0px)'},
      {transform: 'translateY(-273px)'}
    ];
    var timing = {duration: 1000, easing: 'ease-in-out', fill: 'forwards'};
    var player = el.animate(steps, timing);
    player.playbackRate = 0;
    return player;
  }(this.$projectionGroup_.get(0)));

  app.shared.utils.onWebAnimationFinished(this.projectionPlayer_, function() {
    this.isAnimating = false;
  }.bind(this));

  this.waterDashPlayer_ = (function(el) {
    var steps = [
      {'stroke-dashoffset': '-100px'},
      {'stroke-dashoffset': '-200px'}
    ];
    var timing = {duration: 1000, iterations: Infinity};
    var player = el.animate(steps, timing);
    player.pause();
    return player;
  }(this.$waterDashHolder.get(0)));

};

/**
 * Initializes the slideshow by binding events and starting the interval timer.
 */
app.Projection.prototype.init = function() {
  this.addEventListeners_();
  this.startCycle_();
};

/**
 * Prepares to destroy this instance by removing any event listeners and doing
 * additional cleanup work.
 */
app.Projection.prototype.destroy = function() {
  this.removeEventListeners_();
  this.stopCycle_();
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Projection.prototype.addEventListeners_ = function() {
  this.$arrowLeft.on('click', this.prevSlide_);
  this.$arrowRight.on('click', this.nextSlide_);
  this.$clickHandler.on('click', this.onContextClick_);
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Projection.prototype.removeEventListeners_ = function() {
  this.$arrowLeft.off('click', this.prevSlide_);
  this.$arrowRight.off('click', this.nextSlide_);
  this.$clickHandler.off('click', this.onContextClick_);
};

/**
 * Callback for clicking the projector screen. This handles sliding up or down
 * of the screen to show the reindeer easter egg.
 *
 * @private
 */
app.Projection.prototype.onContextClick_ = function() {
  if (this.isAnimating) return;
  this.isAnimating = true;

  window.clearTimeout(this.slidingTimer_);

  if (this.isToggled) {
    this.isToggled = false;

    // Slide the screen down, hiding the easter egg.
    this.projectionPlayer_.playbackRate = -1;
    window.santaApp.fire('sound-trigger', 'briefing_screen_down');

    this.startCycle_();

    this.slidingTimer_ = window.setTimeout(function() {
      this.waterDashPlayer_.pause();  // stop the shower effect
      this.$context_.removeClass(this.CLASS_SHOWERING);
    }.bind(this), app.Constants.SCREEN_SLIDE_DURATION_MS);
  } else {
    this.isToggled = true;

    // Slide the screen up, revealing the easter egg.
    this.projectionPlayer_.playbackRate = 1;
    window.santaApp.fire('sound-trigger', 'briefing_screen_up');

    this.waterDashPlayer_.play();  // start the shower effect
    this.stopCycle_();

    this.slidingTimer_ = window.setTimeout(function() {
      this.$context_.addClass(this.CLASS_SHOWERING);
    }.bind(this), app.Constants.SCREEN_SLIDE_DURATION_MS / 2.5);
  }
};

/**
 * Changes the visible slide by translating a number of pixels on the x-axis.
 *
 * @private
 */
app.Projection.prototype.changeSlide_ = function() {
  var value = this.currentSlide_ * app.Constants.SLIDE_SIZE * -1;

  window.santaApp.fire('sound-trigger', 'briefing_change_slide');

  this.$projection.css({
    '-webkit-transform': 'translateX(' + value + 'px)',
    '-ms-transform': 'translateX(' + value + 'px)',
    transform: 'translateX(' + value + 'px)'
  });
};

/**
 * Moves the projection to the previous slide.
 *
 * @private
 */
app.Projection.prototype.prevSlide_ = function() {
  if (this.isToggled) return;

  window.clearInterval(this.slideshowTimer_);

  this.currentSlide_ = Math.max(this.currentSlide_ - 1, 0);

  if (this.previousSlide_ !== this.currentSlide_) {
    this.previousSlide_ = this.currentSlide_;
    this.changeSlide_();
  }
  this.startCycle_();
};

/**
 * Moves the projection to the next slide.
 *
 * @private
 */
app.Projection.prototype.nextSlide_ = function() {
  if (this.isToggled) return;

  window.clearInterval(this.slideshowTimer_);

  this.currentSlide_++;
  if (this.currentSlide_ > app.Constants.LAST_SLIDE_INDEX) {
    this.currentSlide_ = 0;
  }

  if (this.previousSlide_ !== this.currentSlide_) {
    this.previousSlide_ = this.currentSlide_;
    this.changeSlide_();
  }
  this.startCycle_();
};

/**
 * Stops the interval timer.
 *
 * @private
 */
app.Projection.prototype.stopCycle_ = function() {
  window.clearInterval(this.slideshowTimer_);
};

/**
 * Starts the interval timer to cycle the slides.
 *
 * @private
 */
app.Projection.prototype.startCycle_ = function() {
  window.clearInterval(this.slideshowTimer_);
  this.slideshowTimer_ = window.setInterval(
      this.nextSlide_.bind(this), app.Constants.SCREEN_SLIDE_CYCLE_MS);
};
