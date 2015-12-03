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

'use strict'

goog.provide('app.Drawer');

goog.require('app.Draggable');
goog.require('app.shared.utils');

app.Drawer = function(elem) {
  this.elem = elem || null;
  this.$elem = $(elem);

  this.CLASS_DRAWER_SPRING = 'js-drawer-spring';
  this.CLASS_DRAWER_BELT = 'js-drawer-belt';
  this.CLASS_SPRING = 'js-object-spring';
  this.CLASS_BELT = 'js-object-conveyorBelt';
  this.CLASS_INACTIVE = 'is-inactive';
  this.CLASS_COUNTER = 'js-drawer-counter';
  this.CLASS_DRAGGABLE = 'js-draggable';
  this.CLASS_ANIMATE = 'animate';

  this.$drawers = {};
  this.$drawers[Constants.USER_OBJECT_TYPE_SPRING] = {
    count: 0,
    $node: this.$elem.find( '.' + this.CLASS_DRAWER_SPRING )
  };

  this.$drawers[Constants.USER_OBJECT_TYPE_BELT] = {
    count: 0,
    $node: this.$elem.find( '.' + this.CLASS_DRAWER_BELT )
  };

};

app.Drawer.prototype.add = function(data, type) {
  const $drawer = this.$drawers[type];
  const $node = this.createDOMNode_(data);

  $drawer
    .$node
    .append( $node )
    .find('.js-rotate-handle')
    .remove();

  new app.Draggable( $node );

  this.updateCount( $drawer );
};

app.Drawer.prototype.show = function($drawer) {
  // $drawer.css('height', 0);
  $drawer.addClass('drawer__holder--visible');
};

app.Drawer.prototype.hide = function($drawer) {
  // $drawer.css('height', 0);
  $drawer.addClass('drawer__holder--hidden');
};

app.Drawer.prototype.createDOMNode_ = function(data) {
  const classes = [this.CLASS_DRAGGABLE, 'object ' + data.style.className];
  return $('<div />').addClass(classes.join(' ')).html(data.style.innerHTML || '');
};

app.Drawer.prototype.updateVisibility = function () {
};

app.Drawer.prototype.updateCount = function($drawer) {
  $drawer.count++;
  $drawer.$node.find('.' + this.CLASS_COUNTER).text($drawer.count);
  // utils.animWithClass(this.$el_, this.CLASS_ANIMATE);
};

// @TODO
// - Make sure it works with zero items for both drawers
// - Animate them in
// - Animate number count when dropping it