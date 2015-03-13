
goog.provide('app.shared.LevelUp');

// We are *leaking* the LevelUp global for backwards compatibility.
app.shared.LevelUp = LevelUp;

/**
 * Animation for level up.
 * @constructor
 * @param {!Game} game The current game object.
 * @param {!HTMLElement} bgElem The element for the background.
 * @param {!HTMLElement} numberElem The element for the level number.
 */
function LevelUp(game, bgElem, numberElem) {
  this.bgElem = bgElem;
  this.numberElem = numberElem;

  this.onResizeBound_ = this.onResize_.bind(this);
  $(window).on('resize', this.onResizeBound_);

  this.onResize_();
}

/**
 * Dispose of this LevelUp object, removing listeners.
 */
LevelUp.prototype.dispose = function() {
  $(window).off('resize', this.onResizeBound_);
}

/**
 * Recalculate sizes for background on window resize.
 * @private
 */
LevelUp.prototype.onResize_ = function() {
  var width = window.innerWidth, height = window.innerHeight;

  this.bgBorderWidth = width;
  this.bgElem.css({
    width: width * 2,
    height: width * 2,
    left: width * -0.5,
    top: -(width - height / 2)
  });
};

/**
 * Called after the level number is hidden.
 * @private
 */
LevelUp.prototype.numberHidden_ = function() {
  this.numberElem.removeClass('show hide');
  this.bgElem.removeClass('is-visible');
};

/**
 * Called after the level number is shown.
 * @private
 */
LevelUp.prototype.numberShown_ = function() {
  timeoutOneEvent(this.numberElem, utils.TRANSITION_END, 0.5, this.numberHidden_.bind(this));
  this.numberElem.addClass('hide');
  this.bgElem.css('border-width', 0);

  window.santaApp.fire('sound-trigger', 'level_transition_open');
};

/**
 * Show new level number.
 * @param {number} level The number of the new level.
 * @param {function} callback The function to call while the level is hidden.
 */
LevelUp.prototype.show = function(level, callback) {
  this.bgElem.addClass('is-visible');
  timeoutOneEvent(this.bgElem, utils.TRANSITION_END, 1.0, callback);
  this.bgElem.css('border-width', this.bgBorderWidth);

  timeoutOneEvent(this.numberElem, utils.ANIMATION_END, 1.5, this.numberShown_.bind(this));
  this.numberElem.text(level).addClass('show');

  window.santaApp.fire('sound-trigger', 'level_transition_close');
};

/**
 * A utility for waiting for an event with a timeout.
 * @param {!jQuery} elem
 * @param {string} event
 * @param {number} timeout
 * @param {function} callback
 */
function timeoutOneEvent(elem, event, timeout, callback) {
  // Only trigger callback once.
  var finished = false;
  function finish() {
    if (!finished) {
      finished = true;
      elem.off(event, finish);
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  }

  // Which comes first, the event or the timeout?
  elem.on(event, finish);
  window.setTimeout(finish, timeout * 1000);
}
