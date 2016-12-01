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
goog.require('app.shared.utils');

goog.scope(function() {
  let eventStart, eventMove, eventCancel, eventEnd;

  (function() {
    // Hooray, it's the future!
    if (window.navigator.pointerEnabled) {
      eventStart = 'pointerdown';
      eventMove = 'pointermove';
      eventCancel = 'pointerup pointerout pointermove';
      eventEnd = 'pointerup';
      return;
    }

    eventStart = 'mousedown';
    eventMove = 'mousemove';
    eventCancel = 'mouseup mouseout';
    eventEnd = 'mouseup';

    // If touch is enabled, _add_ touch events. There might still be a mouse connected too.
    if (app.shared.utils.touchEnabled) {
      eventStart += ' touchstart';
      eventMove += ' touchmove';
      eventCancel += ' touchend touchleave touchcancel';
      eventEnd += ' touchend';
    }
  })();

  function getNormalizedEvent(e) {
    // jquery / touch normalization
    e = e.originalEvent ? e.originalEvent : e;
    e = e.touches ? e.touches[0] : e;
    return e;
  }

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

  console.debug('setup app.InputEvent', app.InputEvent);

});
