goog.provide('app.DragDrop');



app.Draggable = function(elem, root) {
  this.el = $(elem);
  this.rootEl = root;
  this.container = $(elem).parent();
  this.el.data('container', this.container);

  this.el.on('mousedown.jamband', this.mousedown.bind(this));
  this.el.on('touchstart.jamband', this.touchstart.bind(this));
};


app.Draggable.prototype.dragStart = function(startX, startY) {
  this.startX = startX;
  this.startY = startY;

  this.el.addClass('dragging');
  this.el.trigger('dragging');

  $('.droppable:not(:has(.draggable))').addClass('dropTarget');
};


app.Draggable.prototype.dragMove = function(left, top) {
  this.el.css({
    position: 'absolute',
    transform: 'translate3d(' + left + 'px, ' + top + 'px, 0px)'
  });
};


app.Draggable.prototype.dragEnd = function(x, y) {
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
        currentDraggable.appendTo(currentDraggable.data('container'));
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


app.Draggable.prototype.getScrollOffsetLeft = function(e) {
  var scrollLeft = 0;

  $(e.target).parents().each(function(index, element) {
    scrollLeft += element.scrollLeft;
  });

  return scrollLeft;
};


app.Draggable.prototype.mousedown = function(e) {
  var startX = e.clientX + this.getScrollOffsetLeft(e);
  var startY = e.clientY;

  this.dragStart(startX, startY);

  $(window).on('mousemove.jamband', this.mousemove.bind(this));
  $(window).on('mouseup.jamband', this.mouseup.bind(this));

  e.preventDefault();
};


app.Draggable.prototype.touchstart = function(e) {
  var startX = e.originalEvent.touches[0].clientX + this.getScrollOffsetLeft(e);
  var startY = e.originalEvent.touches[0].clientY;

  this.dragStart(startX, startY);

  $(window).on('touchmove.jamband', this.touchmove.bind(this));
  $(window).on('touchend.jamband', this.touchend.bind(this));

  e.preventDefault();
};


app.Draggable.prototype.mousemove = function(e) {
  var left = e.clientX - this.startX;
  var top = e.clientY - this.startY;

  this.dragMove(left, top);
  e.preventDefault();
};


app.Draggable.prototype.touchmove = function(e) {
  var left = e.originalEvent.touches[0].clientX - this.startX;
  var top = e.originalEvent.touches[0].clientY - this.startY;

  this.dragMove(left, top);
  e.preventDefault();

  // Store the last known position because touchend doesn't
  this.x = e.originalEvent.touches[0].clientX;
  this.y = e.originalEvent.touches[0].clientY;
};


app.Draggable.prototype.mouseup = function(e) {
  this.dragEnd(e.clientX, e.clientY);

  $(window).off('mousemove.jamband mouseup.jamband');
  e.preventDefault();
};


app.Draggable.prototype.touchend = function(e) {
  this.dragEnd(this.x, this.y);

  $(window).off('touchmove.jamband touchend.jamband');
  e.preventDefault();
};


app.DragDrop = function(root) {
  root.find('.draggable').each(function(index, elem) {
    new app.Draggable($(elem), root);
  });
};
