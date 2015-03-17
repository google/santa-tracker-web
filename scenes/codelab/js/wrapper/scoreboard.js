goog.provide('app.Scoreboard');

/**
 * Manages the scoreboard and game countdown.
 * A minimalistic fork of the shared class. Don't need buttons, countdown
 * or points.
 * @constructor
 * @param {!Element} elem The scoreboard element.
 * @param {number} levels The total number of levels.
 */
app.Scoreboard = function(elem, levels) {
  this.elem = $(elem);
  this.levelElem = this.elem.find('.current-level');
  this.levelItemElems = this.elem.find('.level .level-item');

  if (levels) {
    this.elem.find('.total-levels').text('/' + levels);
  }
};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
app.Scoreboard.prototype.setLevel = function(level) {
  if (this.levelElem.length > 0 && level >= 0) {
    this.levelElem.text(level + 1);
  }

  if (this.levelItemElems.length > 0 && level < 10) {
    this.levelItemElems.removeClass('is-active').eq(level).addClass('is-active');
  }
};
