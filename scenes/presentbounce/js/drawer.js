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
  this.CLASS_DRAWER_HOLDER = 'js-drawer-holder';
  this.CLASS_SPRING = 'js-object-spring';
  this.CLASS_BELT = 'js-object-conveyorBelt';
  this.CLASS_INACTIVE = 'is-inactive';
  this.CLASS_COUNTER = 'js-drawer-counter';
  this.CLASS_DRAGGABLE = 'js-draggable';
  this.CLASS_HOLDER_VISIBLE = 'drawer__holder--visible';
  this.CLASS_COUNT_VISIBLE = 'drawer__counter--visible';
  this.CLASS_OBJECT_VISIBLE = 'object--visible';
  this.CLASS_ANIMATE = 'animate';

  this.onDrag = this.onDrag.bind(this);

  this.$drawers = {};
  this.$drawers[Constants.USER_OBJECT_TYPE_SPRING] = {
    count: 0,
    $node: this.$elem.find( '.' + this.CLASS_DRAWER_SPRING )
  };

  this.$drawers[Constants.USER_OBJECT_TYPE_BELT] = {
    count: 0,
    $node: this.$elem.find( '.' + this.CLASS_DRAWER_BELT )
  };

  this.$drawers[Constants.USER_OBJECT_TYPE_BELT].$node.data('type', Constants.USER_OBJECT_TYPE_BELT);
  this.$drawers[Constants.USER_OBJECT_TYPE_SPRING].$node.data('type', Constants.USER_OBJECT_TYPE_SPRING);

};

app.Drawer.prototype.add = function(data, type, onDropCallback, onTestCallback) {
  var $drawer = this.$drawers[type];
  var $node = this.createDOMNode_(data);

  $drawer
    .$node
    .append( $node )
    .find('.js-rotate-handle')
    .remove();

  this.incrementCount( $drawer );

  new app.Draggable(
    $node,
    this.elem,
    (x, y, errorCallback) => {
      onDropCallback(data, type, {x, y}, errorCallback);
    },
    (x, y, validCallback) => {
      onTestCallback(data, type, {x, y}, validCallback);
    },
    this
  );

};

app.Drawer.prototype.getDrawerTypeFromEl = function($el) {
  return $el.closest('.' + this.CLASS_DRAWER_HOLDER).data('type');
};

app.Drawer.prototype.onDrag = function($el) {
  var drawerType = this.getDrawerTypeFromEl($el);
  this.decrementCount( this.$drawers[drawerType] );
};

app.Drawer.prototype.onDropError = function($el) {
  var drawerType = this.getDrawerTypeFromEl($el);
  this.incrementCount( this.$drawers[drawerType] );
};

app.Drawer.prototype.showDrawer = function($el) {
  $el.addClass( this.CLASS_HOLDER_VISIBLE );
  setTimeout(function() {
    this.showObject( this.getDraggableEl( $el ));
    this.showCounter( this.getCounterEl( $el ) );
  }.bind(this), 200);
};

app.Drawer.prototype.getCounterEl = function($el) {
  return $el.find( '.' + this.CLASS_COUNTER );
};

app.Drawer.prototype.getDraggableEl = function($el) {
  return $el.find( '.' + this.CLASS_DRAGGABLE );
};

app.Drawer.prototype.showObject = function($el) {
  $el.addClass( this.CLASS_OBJECT_VISIBLE );
};

app.Drawer.prototype.hideObject = function($el) {
  $el.removeClass( this.CLASS_OBJECT_VISIBLE );
};

app.Drawer.prototype.showCounter = function($el) {
  $el.addClass( this.CLASS_COUNT_VISIBLE );
};

app.Drawer.prototype.hideCounter = function($el) {
  $el.removeClass( this.CLASS_COUNT_VISIBLE );
};

app.Drawer.prototype.hide = function($el) {
  $el
    .removeClass( this.CLASS_HOLDER_VISIBLE )
    .find( '.' + this.CLASS_COUNTER )
    .removeClass( this.CLASS_COUNT_VISIBLE );
};

app.Drawer.prototype.createDOMNode_ = function(data) {
  var classes = [this.CLASS_DRAGGABLE, 'object ' + data.style.className];
  return $('<div />').addClass(classes.join(' ')).html(data.style.innerHTML || '');
};

app.Drawer.prototype.updateVisibility = function () {
  var $drawer = null;
  for (var prop in this.$drawers) {
    if (this.$drawers.hasOwnProperty(prop)) {
      $drawer = this.$drawers[prop];
      ($drawer.count > 0) ? this.showDrawer($drawer.$node) : this.hide($drawer.$node);
    }
  }
};

app.Drawer.prototype.incrementCount = function($drawer) {
  $drawer.count++;
  this.updateCountText($drawer);
};

app.Drawer.prototype.decrementCount = function($drawer) {
  $drawer.count = Math.max($drawer.count-1, 0);
  if ($drawer.count === 0) {
    this.hideCounter( this.getCounterEl($drawer.$node) );
  }
  this.updateCountText($drawer);
};

app.Drawer.prototype.updateCountText = function($drawer) {
  var $node = $drawer.$node;
  $node
    .find('.' + this.CLASS_COUNTER)
    .text($drawer.count);

  this.animateCount($node);
};

app.Drawer.prototype.animateCount = function($node) {
  utils.animWithClass($node.find('.' + this.CLASS_COUNTER), this.CLASS_ANIMATE);
};