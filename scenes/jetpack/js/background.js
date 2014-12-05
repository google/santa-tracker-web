goog.provide('app.Background');



/**
 * Manages the dynamic background color and level transitions.
 * @param {jQuery} els contains two elements, current and next level background divs.
 * @constructor
 */
app.Background = function(els) {
  this.currentEl = els.eq(0);
  this.nextEl = els.eq(1);
  this.transitionLevel = 0;
  this.transitionProgress = null;

  this.reset();
};


/**
 * Height of app.Backgrounds in percentages relative to the
 * window innerHeight.
 * @type {number}
 */
app.Background.BACKGROUND_HEIGHT = 150;


/**
 * How long should it take to transition between levels?
 * @type {number}
 */
app.Background.TRANSITION_DURATION = 5;


/**
 * Resets the app.Backgrounds for a new game.
 */
app.Background.prototype.reset = function() {
  this.transitionLevel = 0;

  this.nextEl.attr('class', 'background background--0');
  this.endTransition_();
};


/**
 * Starts a new level transition.
 */
app.Background.prototype.transition = function() {
  this.transitionProgress = 0;
};


/**
 * Cleans up after a transition and prepares for the next transition.
 * @private
 */
app.Background.prototype.endTransition_ = function() {
  this.transitionProgress = null;
  this.transitionLevel++;

  var nextEl = this.currentEl;
  this.currentEl = this.nextEl;
  this.nextEl = nextEl;

  this.currentEl.css({
    transform: 'translateZ(0)',
    zIndex: 0
  });
  this.nextEl.css({
    transform: 'translate3d(0, -100%, 0)',
    zIndex: 1
  });

  // Prepare next level right away to push paint lag until after transition.
  this.nextEl.attr('class',
      'background background--' + this.transitionLevel);
};


/**
 * Updates the background by a specific time delta.
 * @param {number} delta seconds since last frame.
 */
app.Background.prototype.onFrame = function(delta) {
  if (this.transitionProgress == null) {
    return;
  }

  this.transitionProgress += delta / app.Background.TRANSITION_DURATION;
  if (this.transitionProgress > 1) {
    this.endTransition_();
    return;
  }

  var yPercentage = -100 + this.transitionProgress * 100;
  this.nextEl.css('transform', 'translate3d(0, ' + yPercentage + '%, 0)');
};
