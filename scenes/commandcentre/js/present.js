goog.require('app.Constants');

goog.provide('app.Present');



/**
 * Class for a present on the belt
 * @param {Element} el DOM element containing the markup of the item
 * @constructor
 */
app.Present = function(el) {
  this.$el = $(el);
  this.free = true;
  this.width_ = undefined;
  this.margin_ = this.getRandomMargin_();
};


app.Present.prototype = {
  /**
   * Return random margin to next present
   * @private
   * @return {number}
   */
  getRandomMargin_: function() {
    var max = app.Constants.PRESENTS_MARGIN_MAX - app.Constants.PRESENTS_MARGIN_MIN + 1;
    var min = app.Constants.PRESENTS_MARGIN_MIN;
    return Math.floor(Math.random() * max + min);
  },

  /**
   * Flag present as being used
   */
  use: function() {
    this.free = false;
  },

  /**
   * Check if present is free for use
   * @return {boolean}
   */
  isFree: function() {
    return this.free;
  },

  /**
   * Callback when present enters belt
   */
  onEnterBelt: function() {
  },

  /**
   * Callback when present leaves the belt
   */
  onExitBelt: function() {
    this.free = true;
  },

  /**
   * Returns width of present
   * @return {number}
   */
  width: function() {
    if (!this.width_) {
      this.width_ = this.$el.width();
    }
    return this.width_;
  },

  /**
   * Returns width of present with margin to next present
   * @return {number}
   */
  outerWidth: function() {
    return this.width() + this.margin_;
  }
};
