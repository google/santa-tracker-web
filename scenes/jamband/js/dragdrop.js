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

goog.provide('app.DragDrop');

/**
 * @param {!Element|!jQuery} elem that can be dragged
 * @param {!Element|!jQuery} root to use to find droppable targets
 * @constructor
 */
app.Draggable = function(elem, root) {
  this.el = $(elem);
  this.rootEl = $(root);
  this.container = $(elem).parent();
  this.el.data('container', this.container);

  this.el.on('mousedown.jamband', this.mousedown_.bind(this));
  this.el.on('touchstart.jamband', this.touchstart_.bind(this));
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
  this.el.trigger('dragging');

  this.rootEl.find('.droppable:not(:has(.draggable))').addClass('dropTarget');
};

/**
 * @param {number} left position
 * @param {number} top position
 * @private
 */
app.Draggable.prototype.dragMove_ = function(left, top) {
  this.el.css({
    position: 'absolute',
    transform: 'translate3d(' + left + 'px, ' + top + 'px, 0px)'
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

  var droppable = this.rootEl.find('.droppable').filter(isDragOver).first();

  if (droppable.length) {
    var currentDraggable = droppable.find('.draggable');

    if (currentDraggable.length && !currentDraggable.is(this.el)) {
      // If there's already a draggable in the droppable, swap them or return
      if (this.el.parent().hasClass('droppable')) {
        currentDraggable.appendTo(this.el.parent());
        currentDraggable.trigger('dropped', this.el.parent().data());
      } else {
        var container = /** @type {!Element} */ (currentDraggable.data('container'));
        currentDraggable.appendTo(container);
        currentDraggable.trigger('dragging');
        currentDraggable.trigger('returned');
      }
    }

    this.el.appendTo(droppable);
    this.el.trigger('dropped', droppable.data());
  } else {
    this.el.appendTo(this.container);
    this.el.trigger('returned');
  }

  this.el.css({
    position: '',
    transform: ''
  });
  this.el.removeClass('dragging');
  this.rootEl.find('.droppable').removeClass('dropTarget');
};

/**
 * @param {!jQuery.Event} e to find left offset
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
 * @param {!jQuery.Event} e mouse event
 * @private
 */
app.Draggable.prototype.mousedown_ = function(e) {
  var startX = e.clientX + this.getScrollOffsetLeft_(e);
  var startY = e.clientY;

  this.dragStart_(startX, startY);

  $(window).on('mousemove.jamband', this.mousemove_.bind(this));
  $(window).on('mouseup.jamband', this.mouseup_.bind(this));

  e.preventDefault();
};

/**
 * @param {!jQuery.Event} e touch event
 * @private
 */
app.Draggable.prototype.touchstart_ = function(e) {
  var startX = e.originalEvent.touches[0].clientX + this.getScrollOffsetLeft_(e);
  var startY = e.originalEvent.touches[0].clientY;

  this.dragStart_(startX, startY);

  $(window).on('touchmove.jamband', this.touchmove_.bind(this));
  $(window).on('touchend.jamband', this.touchend_.bind(this));

  e.preventDefault();
};

/**
 * @param {!jQuery.Event} e mouse event
 * @private
 */
app.Draggable.prototype.mousemove_ = function(e) {
  var left = e.clientX - this.startX;
  var top = e.clientY - this.startY;

  this.dragMove_(left, top);
  e.preventDefault();
};

/**
 * @param {!jQuery.Event} e touch event
 * @private
 */
app.Draggable.prototype.touchmove_ = function(e) {
  var left = e.originalEvent.touches[0].clientX - this.startX;
  var top = e.originalEvent.touches[0].clientY - this.startY;

  this.dragMove_(left, top);
  e.preventDefault();

  // Store the last known position because touchend doesn't
  this.x = e.originalEvent.touches[0].clientX;
  this.y = e.originalEvent.touches[0].clientY;
};

/**
 * @param {!jQuery.Event} e mouse event
 * @private
 */
app.Draggable.prototype.mouseup_ = function(e) {
  this.dragEnd_(e.clientX, e.clientY);

  $(window).off('mousemove.jamband mouseup.jamband');
  e.preventDefault();
};

/**
 * @param {!jQuery.Event} e touch event
 * @private
 */
app.Draggable.prototype.touchend_ = function(e) {
  this.dragEnd_(this.x, this.y);

  $(window).off('touchmove.jamband touchend.jamband');
  e.preventDefault();
};

/**
 * Creates app.Draggable instances for all valid elements under the root, but
 * only if Web Audio is supported.
 * @param {!Element|!jQuery} root element to search under
 * @constructor
 */
app.DragDrop = function(root) {
  if (app.Audio.isSupported()) {
    root = $(root);
    root.find('.draggable').each(function(index, elem) {
      new app.Draggable($(elem), root);
    });
  }
};
