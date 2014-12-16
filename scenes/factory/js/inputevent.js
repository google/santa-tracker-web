goog.provide('app.InputEvent');

goog.scope(function() {
  var eventStart, eventMove, eventCancel, eventEnd;

  (function() {
    if (window.navigator.pointerEnabled) {
      eventStart = 'pointerdown';
      eventMove = 'pointerMove';
      eventCancel = 'pointerup pointerout pointermove';
      eventEnd = 'pointerup';
    } else if (window.navigator.msPointerEnabled) {
      eventStart = 'MSPointerDown';
      eventMove = 'MSPointerMove';
      eventCancel = 'MSPointerUp MSPointerOut MSPointerMove';
      eventEnd = 'MSPointerUp';
    } else if (Modernizr.touch) {
      eventStart = 'touchstart';
      eventMove = 'touchmove';
      eventCancel = 'touchend touchleave touchcancel';
      eventEnd = 'touchend';
    } else {
      eventStart = 'mousedown';
      eventMove = 'mousemove';
      eventCancel = 'mouseup mouseout';
      eventEnd = 'mouseup';
    }
  })();

  var getNormalizedEvent = function(e) {
    // jquery / touch normalization
    e = e.originalEvent ? e.originalEvent : e;
    e = e.touches ? e.touches[0] : e;
    return e;
  };

  /**
   * Input events name constants - depending on device support
   * @const
   */
  app.InputEvent = {
    CANCEL: eventCancel,
    START: eventStart,
    MOVE: eventMove,
    END: eventEnd,
    normalize: getNormalizedEvent
  };
});
