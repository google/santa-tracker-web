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

goog.provide('app.InputEvent');

goog.scope(function() {
  var eventStart, eventMove, eventCancel, eventEnd;

  (function() {
    var touchEnabled = ('ontouchstart' in window) ||
        window.DocumentTouch && document instanceof DocumentTouch;

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
    } else if (touchEnabled) {
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
