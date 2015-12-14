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

goog.require('app.InputEvent');
goog.provide('app.Draggable');

/**
 * @param {!Element} elem that can be dragged
 * @param {!Element} root to use to find droppable targets
 * @param {!function(data, type, {x, y}), errorCallback} onDropCallback callback function to be called when a drop happens
 * @param {!function(data, type, {x, y}, validCallback)} testDropCallback callback function to be called when testing if a drop is valid happens
 * @param {!app.Drawer} drawer the drawer instance
 * @param {!Object} data Config data being passed from the level.
 * @param {!game} game the game instance
 * @constructor
 */
app.Draggable = function(elem, root, onDropCallback, testDropCallback, drawer, data, game) {
  this.el = $(elem);
  this.rootEl = root;
  this.onDropCallback = onDropCallback;
  this.testDropCallback = testDropCallback;
  this.drawer = drawer;
  this.data_ = data;
  this.game_ = game;

  this.container = $(elem).parent();
  this.el.data('container', this.container);

  this.$document = $(document);

  this.onInputStart_ = this.onInputStart_.bind(this);
  this.onInputMove_ = this.onInputMove_.bind(this);
  this.onInputEnd_ = this.onInputEnd_.bind(this);

  this.el.on(app.InputEvent.START, this.onInputStart_);

  this.el.addClass('draggable');
};

/**
 * @param {number} startX position
 * @param {number} startY position
 * @private
 */
app.Draggable.prototype.dragStart_ = function(startX, startY) {

  // Set size of element to match Box2D world
  const scale = this.game_.getViewport().scale;
  const padding = this.data_.style.padding || 0;
  const width = (this.data_.style.width + padding*2) * scale;
  const height = (this.data_.style.height + padding*2) * scale;
  this.el.css({
    width: width,
    height: height,
    marginLeft: width/-2,
    marginTop: height/-2,
    transform: 'none'
  });

  this.startX = startX;
  this.startY = startY;

  // Calculate mouse offset from center of element
  const offsetX = this.el.offset().left - (startX - width/2);
  const offsetY = this.el.offset().top - (startY - height/2);
  this.startOffsetX = offsetX;
  this.startOffsetY = offsetY;

  this.el.addClass('dragging');
  this.drawer.onDrag(this.el);
};

/**
 * @param {number} left position
 * @param {number} top position
 * @private
 */
app.Draggable.prototype.dragMove_ = function(left, top, x, y) {
  this.el.css({
    position: 'absolute',
    transform: 'translate3d(' + left + 'px, ' + top + 'px, 0px)'
  });

  this.testDropCallback(x + this.startOffsetX, y + this.startOffsetY, (valid) => {
    this.el.toggleClass('no-drop', !valid);
  });
};

/**
 * @param {number} x end position
 * @param {number} y end position
 * @private
 */
app.Draggable.prototype.dragEnd_ = function(x, y) {
  var isDragOver = function(index, droppable) {
    var rect = droppable.getBoundingClientRect();
    return rect.left < x &&
        x < (rect.left + rect.width) &&
        rect.top < y &&
        y < (rect.top + rect.height);
  };

  // check if dropped in zone
  var dropZoneEl = this.rootEl.find('.js-drop-target').filter(isDragOver).first();

  if (dropZoneEl.length) {
    this.onDropCallback(x + this.startOffsetX, y + this.startOffsetY, (hasError) => {
      if (hasError) {
        this.drawer.onDropError(this.el);
      }
      else {
        this.drawer.onDropSuccess(this.el);
      }
    });
  } else {
    this.drawer.onDropError(this.el);
  }

  this.el.css({
    position: '',
    transform: '',
    margin: '',
    width: '',
    height: ''
  });
  this.el.removeClass('dragging');
};


/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.onInputStart_ = function(e) {
  var startX = null;
  var startY = null;


  e = app.InputEvent.normalize(e);

  if (this.drawer.isPaused()) return;

  if (e.hasOwnProperty('touches')) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else {
    startX = e.clientX;
    startY = e.clientY;
  }

  this.dragStart_(startX, startY);

  this.$document.on(app.InputEvent.MOVE, this.onInputMove_);
  this.$document.on(app.InputEvent.END, this.onInputEnd_);

  e.preventDefault();
};

/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.onInputMove_ = function(e) {
  var left = null;
  var top = null;

  e = app.InputEvent.normalize(e);

  if (e.hasOwnProperty('touches')) {

    left = e.touches[0].clientX - this.startX;
    top = e.touches[0].clientY - this.startY;

    // Store the last known position because touchend doesn't
    this.x = e.touches[0].clientX;
    this.y = e.touches[0].clientY;

  } else {

    left = e.clientX - this.startX;
    top = e.clientY - this.startY;

    // Store the last known position because touchend doesn't
    this.x = e.clientX;
    this.y = e.clientY;
  }

  this.dragMove_(left, top, this.x, this.y);
  e.preventDefault();

};

/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.onInputEnd_ = function(e) {
  this.dragEnd_(this.x, this.y);

  this.$document.off(app.InputEvent.END, this.onInputEnd_);
  e.preventDefault();
};