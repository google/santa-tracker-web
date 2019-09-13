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

goog.require('app.Constants');

goog.provide('app.BeltItem');

/**
 * Class for an item on the belt
 * @param {!Element} el DOM element containing the markup of the item
 * @constructor
 */
app.BeltItem = function(el) {
  this.$el = $(el);
  this.id = this.$el.data('id');
  this.type = this.$el.data('type');
  this.crazyType = this.$el.data('crazyType');
  this.color = this.$el.data('color');
  this.free = true;
  this.width_ = undefined;
};

app.BeltItem.prototype = {

  use: function() {
    this.free = false;
  },

  isFree: function() {
    return this.free;
  },

  isElf: function() {
    return this.type === app.Constants.TYPE_ELF;
  },

  isReindeer: function() {
    return this.type === app.Constants.TYPE_REINDEER;
  },

  enterBelt: function() {
    this.$el.css('visibility', 'visible');
  },

  exitBelt: function() {
    this.free = true;
    this.$el.css('visibility', 'hidden');
    this.$el.css('background', '');
  },

  width: function() {
    if (!this.width_) {
       this.width_ = this.$el.width();
    }
    return this.width_;
  },

  outerWidth: function() {
    return this.width() + app.Constants.MARGIN;
  },

  startCrazyAnimation: function() {
    this.$el.addClass('elf-' + this.crazyType);

    if (this.crazyType === 'passedOut') {
      window.santaApp.fire('sound-trigger', 'airport_fall');
    }

    if (this.crazyType === 'sleeping') {
      window.santaApp.fire('sound-trigger', 'airport_fall');
    }

    if (this.crazyType === 'rollingOnBack') {
      window.santaApp.fire('sound-trigger', 'airport_fall');
    }

    if (this.crazyType === 'fallingBackwards') {
      // TODO: Add support for second argument.
      //window.santaApp.fire('sound-trigger', {name: 'airport_fall', args: [1]});
      window.santaApp.fire('sound-trigger', 'airport_fall');
    }
  },

  stopCrazyAnimation: function() {
    this.$el.removeClass('elf-' + this.crazyType);
  }
};
