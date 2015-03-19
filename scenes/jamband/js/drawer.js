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

goog.provide('app.Drawer');

/**
 * A drawer to store the instruments in
 *
 * @param {!Element} elem A DOM element which wraps the game.
 * @constructor
 */
app.Drawer = function(elem) {
  this.drawer = elem.find('.Drawer');
  var tab = elem.find('#drawer-tab');
  var scrollable = elem.find('#drawer-scrollable');

  tab.on('mouseup.jamband touchend.jamband', this.toggle.bind(this));

  var scrollToOffset = function(direction) {
    var offset = scrollable.find('.InstrumentContainer:not(.collapse)').first().width() * direction;
    var position = Math.floor((scrollable.scrollLeft() + offset) / offset) * offset;
    scrollable.animate({scrollLeft: position}, {duration: 300});
  };

  elem.find('#drawer-arrow--left').on('click.jamband touchend.jamband', function() {
    scrollToOffset(-1);
  });

  elem.find('#drawer-arrow--right').on('click.jamband touchend.jamband', function() {
    scrollToOffset(1);
  });
};

/**
 * Show or hide the drawer
 */
app.Drawer.prototype.toggle = function() {
  this.drawer.toggleClass('Drawer--hidden');
};
