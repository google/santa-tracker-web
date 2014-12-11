goog.require('app.Present');

goog.provide('app.PresentPool');



/**
 * Class for pooling reusable Present instances
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Array} domEls Array of DOM element containing the markup for each Present
 * @constructor
 */
app.PresentPool = function(domEls) {
  this.items_ = [];
  this.counter_ = -1;

  this.load_(domEls);
};


app.PresentPool.prototype = {
  /**
   * Load pool from elements in the markup
   * @private
   */
  load_: function(domEls) {
    var l = domEls.length;
    for (var i = 0; i < l; i++) {
      this.items_.push(new app.Present(domEls[i]));
    }
  },

  /**
   * Get next free Present in the pool
   * @public
   * @return {Present}
   */
  getFreeItem: function() {
    var l = this.items_.length,
        i = 0,
        item = null;

    // cycle trough the pool in order and find free item
    while (item === null && i < this.items_.length) {
      this.counter_++;
      var nextItem = this.items_[this.counter_ % this.items_.length];
      if (nextItem.isFree()) {
        nextItem.use();
        item = nextItem;
      }
      i++;
    }

    return item;
  }
};
