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

goog.provide('app.Draggable');

/**
 * @param {!Element} elem that can be dragged
 * @param {!Element} root to use to find droppable targets
 * @constructor
 */
app.Draggable = function(elem, root, onDropCallback, testDropCallback) {
  this.el = $(elem);
  this.rootEl = root;
  this.onDropCallback = onDropCallback;
  this.testDropCallback = testDropCallback;

  this.container = $(elem).parent();
  this.el.data('container', this.container);

  this.el.on('mousedown.presentbounce', this.mousedown_.bind(this));
  this.el.on('touchstart.presentbounce', this.touchstart_.bind(this));

  this.el.addClass('draggable');
};

/**
 * @param {number} startX position
 * @param {number} startY position
 * @private
 */
app.Draggable.prototype.dragStart_ = function(startX, startY) {
  this.startX = startX;
  this.startY = startY;
  this.el.addClass('dragging');
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

  this.testDropCallback(x, y, (valid) => {
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
    this.onDropCallback(x, y, (error) => {
      // callback only called if overlap was detected
      console.log('DROP ERROR DETECTED', error);
    });
  }

  this.el.css({
    position: '',
    transform: ''
  });
  this.el.removeClass('dragging');
};

/**
 * @param {!Element} e to find left offset
 * @return {number} combined scrollLeft
 * @private
 */
app.Draggable.prototype.getScrollOffsetLeft_ = function(e) {
  var scrollLeft = 0;

  $(e.target).parents().each(function(index, element) {
    scrollLeft += element.scrollLeft;
  });

  return scrollLeft;
};

/**
 * @param {!Event} e mouse event
 * @private
 */
app.Draggable.prototype.mousedown_ = function(e) {
  var startX = e.clientX + this.getScrollOffsetLeft_(e);
  var startY = e.clientY;

  this.dragStart_(startX, startY);

  $(window).on('mousemove.presentbounce', this.mousemove_.bind(this));
  $(window).on('mouseup.presentbounce', this.mouseup_.bind(this));

  e.preventDefault();
};

/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.touchstart_ = function(e) {
  var startX = e.originalEvent.touches[0].clientX + this.getScrollOffsetLeft_(e);
  var startY = e.originalEvent.touches[0].clientY;

  this.dragStart_(startX, startY);

  $(window).on('touchmove.presentbounce', this.touchmove_.bind(this));
  $(window).on('touchend.presentbounce', this.touchend_.bind(this));

  e.preventDefault();
};

/**
 * @param {!Event} e mouse event
 * @private
 */
app.Draggable.prototype.mousemove_ = function(e) {
  var left = e.clientX - this.startX;
  var top = e.clientY - this.startY;

  this.dragMove_(left, top, e.clientX, e.clientY);
  e.preventDefault();
};

/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.touchmove_ = function(e) {
  var left = e.originalEvent.touches[0].clientX - this.startX;
  var top = e.originalEvent.touches[0].clientY - this.startY;

  // Store the last known position because touchend doesn't
  this.x = e.originalEvent.touches[0].clientX;
  this.y = e.originalEvent.touches[0].clientY;

  this.dragMove_(left, top, x, y);
  e.preventDefault();

};

/**
 * @param {!Event} e mouse event
 * @private
 */
app.Draggable.prototype.mouseup_ = function(e) {
  this.dragEnd_(e.clientX, e.clientY);

  $(window).off('mousemove.presentbounce mouseup.presentbounce');
  e.preventDefault();
};

/**
 * @param {!Event} e touch event
 * @private
 */
app.Draggable.prototype.touchend_ = function(e) {
  this.dragEnd_(this.x, this.y);

  $(window).off('touchmove.presentbounce touchend.presentbounce');
  e.preventDefault();
};

/**
 * Creates app.Draggable instances for all valid elements under the root, but
 * only if Web Audio is supported.
 * @param {!Element} root element to search under
 * @constructor
 */
// app.DragDrop = function(root) {
  // if (app.Audio.isSupported()) {
    // root.find('.js-draggable').each(function(index, elem) {
      // new app.Draggable($(elem), root);
    // });
  // }
// };
