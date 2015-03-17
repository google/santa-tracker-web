goog.require('app.BeltItem');

goog.provide('app.BeltItemPool');

/**
 * Class for pooling reusable belt item instances
 * @param {!jQuery} domEls Array of DOM element containing the markup for each BeltItem
 * @constructor
 */
app.BeltItemPool = function(domEls) {
  this.items_ = [];
  this.lastUsedItem_ = null;
  this.counter_ = -1;

  var l = domEls.length;
  for (var i = 0; i < l; i++) {
    this.addItem(domEls[i]);
  }
};

app.BeltItemPool.prototype = {

  /**
   * @private
   * @return {boolean}
   */
  notSameAsPrevious_: function(item) {
    if (!this.lastUsedItem_) {
      return true;
    }
    return this.lastUsedItem_.id != item.id && this.lastUsedItem_.crazyType != item.crazyType;
  },

  addItem: function(domEl) {
    this.items_.push(new app.BeltItem(domEl));
  },

  /**
   * @return {app.BeltItem}
   */
  getFreeItem: function() {
    var l = this.items_.length,
        i = 0,
        item = null;

    // grab them in order - make sure we don't put two of the same type in a row
    while (item === null && i < this.items_.length) {
      this.counter_++;
      var nextItem = this.items_[this.counter_ % this.items_.length];
      if (nextItem.isFree() && this.notSameAsPrevious_(nextItem)) {
        nextItem.use();
        this.lastUsedItem_ = nextItem;
        item = nextItem;
      }
      i++;
    }

    return item;
  }

};
