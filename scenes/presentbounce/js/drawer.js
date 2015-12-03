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
  this.CLASS_HOLDER_VISIBLE = 'drawer__holder--visible';
  this.CLASS_COUNT_VISIBLE = 'drawer__counter--visible';
  this.CLASS_OBJECT_VISIBLE = 'object--visible';
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
  var $drawer = this.$drawers[type];
  var $node = this.createDOMNode_(data);

  $drawer
    .$node
    .append( $node )
    .find('.js-rotate-handle')
    .remove();

  this.updateCount( $drawer );

  new app.Draggable(
    $node, 
    this.elem, 
    (x, y, errorCallback) => {
      onDropCallback(data, type, {x, y}, errorCallback);
    },
    (x, y, validCallback) => {
      onTestCallback(data, type, {x, y}, validCallback);
    }
  );

};

app.Drawer.prototype.showDrawer = function($el) {
  $el.addClass( this.CLASS_HOLDER_VISIBLE );
  setTimeout(function() {
    this.showObject($el.find( '.' + this.CLASS_DRAGGABLE ).first());
    this.showCounter($el.find( '.' + this.CLASS_COUNTER ));
  }.bind(this), 200);
};

app.Drawer.prototype.showObject = function($el) {
  $el.addClass( this.CLASS_OBJECT_VISIBLE );
}

app.Drawer.prototype.hideObject = function($el) {
  $el.removeClass( this.CLASS_OBJECT_VISIBLE );
}

app.Drawer.prototype.showCounter = function($el) {
  $el.addClass( this.CLASS_COUNT_VISIBLE );
}

app.Drawer.prototype.hideCounter = function($el) {
  $el.removeClass( this.CLASS_COUNT_VISIBLE );
}

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

app.Drawer.prototype.updateCount = function($drawer) {
  $drawer.count++;

  $drawer
    .$node
    .find('.' + this.CLASS_COUNTER)
    .text($drawer.count);

}

app.Drawer.prototype.animateCount = function($el) {
  utils.animWithClass($el.find('.' + this.CLASS_COUNTER), this.CLASS_ANIMATE);
};

// @TODO
// - Make sure it works with zero items for both drawers
// - Animate them in on desktop
// - Animate them in on mobile
// - Animate number count when dropping it