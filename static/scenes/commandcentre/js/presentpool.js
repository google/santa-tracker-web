/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.require('app.Present');

goog.provide('app.PresentPool');



/**
 * Class for pooling reusable Present instances
 * @param {!Array.<!Element>} domEls Array of DOM element containing the markup for each Present
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
   * @return {app.Present}
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
