goog.require('app.Constants');

goog.provide('app.Present');



/**
 * Class for a present on the belt
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} el DOM element containing the markup of the item
 * @constructor
 */
app.Present = function(el) {
  this.$el = $(el);
  this.free = true;
  this.width_ = undefined;
  this.margin_ = this.getRandomMargin_();
  this.hide_();
};


app.Present.prototype = {
  getRandomMargin_: function() {
    var max = app.Constants.PRESENTS_MARGIN_MAX - app.Constants.PRESENTS_MARGIN_MIN + 1;
    var min = app.Constants.PRESENTS_MARGIN_MIN;
    return Math.floor(Math.random() * max + min);
  },

  hide_: function() {
    TweenMax.set(this.$el, {background: '', visibility: 'hidden'});
  },

  show_: function() {
    TweenMax.set(this.$el, {visibility: 'visible'});
  },

  use: function() {
    this.free = false;
  },

  isFree: function() {
    return this.free;
  },

  onEnterBelt: function() {
    this.show_();
  },

  onExitBelt: function() {
    this.free = true;
    this.hide_();
  },

  width: function() {
    if (!this.width_) {
      this.width_ = this.$el.width();
    }
    return this.width_;
  },

  outerWidth: function() {
    return this.width() + this.margin_;
  }
};
