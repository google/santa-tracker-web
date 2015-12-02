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

app.Drawer = function(elem) {
  this.elem = elem || null;
  this.$elem = $(elem);
  this.$drawers = {};
  this.$drawers[Constants.USER_OBJECT_TYPE_SPRING] = this.$elem.find('.js-drawer-spring');
  this.$drawers[Constants.USER_OBJECT_TYPE_BELT] = this.$elem.find('.js-drawer-belt');

  this.CLASS_SPRING = 'js-object-spring';
  this.CLASS_BELT = 'js-object-conveyorBelt';
  this.CLASS_INACTIVE = 'is-inactive';
};

app.Drawer.prototype.add = function(data, type) {
  this.$drawers[type].append( this.createDOMNode_(data) );
};

app.Drawer.prototype.createDOMNode_ = function(data) {
  return
    $('<div/>')
      .addClass('object ' + data.style.className)
      .html(data.style.innerHTML || '')
      .find('.js-rotate-handle')
      .remove();
};

app.Drawer.prototype.addSpring = function($spring) {
  this.$springsDrawer.append( $spring.addClass( this.CLASS_INACTIVE ) );
};

app.Drawer.prototype.addBelt = function($belt) {
  this.$beltsDrawer.append( $belt.addClass( this.CLASS_INACTIVE ) );
};

app.Drawer.prototype.setObjectsVisibility = function () {
};

app.Drawer.prototype.updateObjectCount = function($drawer) {
};