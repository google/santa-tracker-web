
goog.provide('app.shared.Tutorial');

// We are *leaking* the Tutorial global for backwards compatibility.
app.shared.Tutorial = Tutorial;

/**
 * Tutorial animation.
 * Can be used to explain: mouse click, space press, arrows,
 * touch swipe, rotate the device, tilting, tap the screen,
 * and how to play matching.
 * @constructor
 * @param {Element} moduleElem The module element.
 * @param {String} touchTutorials Tutorials when touch is enabled.
 * @param {String} notouchTutorials Tutorials when touch is disabled.
 */
function Tutorial(moduleElem, touchTutorials, notouchTutorials) {
  // Ability to disable tutorial
  this.enabled = true;
  this.first = true;
  this.hasTouch = Modernizr.touch;

  // Tutorial element
  this.elem = $('<div class="tutorial"><div class="tutorial-inner"></div></div>');
  $(moduleElem).append(this.elem);

  if (this.hasTouch) {
    this.tutorials = touchTutorials.split(' ');
  } else {
    this.tutorials = notouchTutorials.split(' ');
  }

  this.ontimeout_ = this.ontimeout_.bind(this);
}

// Default timeouts
Tutorial.FIRST_TIMEOUT = 5000;
Tutorial.SECOND_TIMEOUT = 3000;

/**
 * Start the tutorial timer.
 */
Tutorial.prototype.start = function() {
  if (!this.tutorials.length)
    return;

  this.timer = window.setTimeout(this.ontimeout_,
    this.first ? Tutorial.FIRST_TIMEOUT : Tutorial.SECOND_TIMEOUT);
  this.first = false;
};

/**
 * Turn off a tutorial because user has already used the controls.
 * @param {String} name The name of the tutorial.
 */
Tutorial.prototype.off = function(name) {
  this.tutorials = this.tutorials.filter(function(tut, i) {
    return tut != name;
  });

  // Stop timer if no tutorials are left
  if (!this.tutorials.length) {
    this.dispose();
  }

  // Hide tutorial if the current one is turned off
  if (this.current === name) {
    this.hide_();
    this.start();
  }
};

/**
 * When the wait has ended.
 */
Tutorial.prototype.ontimeout_ = function() {
  this.show_(this.tutorials.shift());
};

/**
 * Display a tutorial.
 */
Tutorial.prototype.show_ = function(name) {
  this.current = name;
  this.elem.addClass(name).show();
};

/**
 *  Hide the tutorial
 */
Tutorial.prototype.hide_ = function() {
  this.elem.hide().removeClass(this.current);
};

/**
 * Cleanup
 */
Tutorial.prototype.dispose = function() {
  window.clearTimeout(this.timer);
};
