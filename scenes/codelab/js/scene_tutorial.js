goog.provide('app.SceneTutorial');

/**
 * Manages the display of a tutorial animation for the game.
 * @param {Element} el the .tutorial element.
 * @constructor
 */
app.SceneTutorial = function(el) {
  this.el = el;

  this.visible_ = false;
  this.scheduleTimeout_ = null;

  this.el.addEventListener('click', this.onClick_.bind(this), false);
  document.body.addEventListener('blocklyDragBlock',
      this.onBlocklyChange_.bind(this), false);
  document.body.addEventListener('blocklyClickFlyoutBlock',
      this.onBlocklyClickBlock_.bind(this), false);
};

/**
 * Schedules displaying the tutorial. Only happens max once, some time after the
 * first time requested.
 */
app.SceneTutorial.prototype.schedule = function() {
  // Blockly does some non-user initiated workspace changes on timeout, so we wait for
  // them to finish.
  this.scheduleTimeout_ = setTimeout(this.toggle.bind(this, true), 4000);
};

/**
 * Shows or hides the tutorial.
 * @param {boolean} visible is true to show the tutorial, otherwise false.
 */
app.SceneTutorial.prototype.toggle = function(visible) {
  if (this.scheduleTimeout_) {
    clearTimeout(this.scheduleTimeout_);
    this.scheduleTimeout_ = null;
  }

  this.visible_ = visible;
  this.el.style.display = visible ? 'block' : 'none';
};

/**
 * Hide the tutorial on tap/click.
 * @private
 */
app.SceneTutorial.prototype.onClick_ = function() {
  this.toggle(false);
};

/**
 * Hide the tutorial on edit blockly workspace.
 * @private
 */
app.SceneTutorial.prototype.onBlocklyChange_ = function() {
  if (this.visible_ || this.scheduleTimeout_) {
    this.toggle(false);
  }
};

/**
 * Show the tutorial on click toolbar block.
 * @private
 */
app.SceneTutorial.prototype.onBlocklyClickBlock_ = function() {
  this.toggle(true);
};
