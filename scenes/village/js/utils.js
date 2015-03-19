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

/**
 * @type {Object}
 */
var VillageUtils = {};

/**
 * Re-triggers a given event on one object to another.
 *
 * @param {Object} origin the object where the event originates.
 * @param {string} eventName the event name.
 * @param {Object} target the object to trigger the event.
 * @param {string=} newEventName the event name to trigger on target.
 * @return {SantaEventListener}
 */
VillageUtils.forwardEvent = function(origin, eventName, target, newEventName) {
  if (!newEventName) {
    newEventName = eventName;
  }
  return Events.addListener(origin, eventName,
      Events.trigger.bind(window, target, newEventName));
};

/**
 * Transform CSS property name, with vendor prefix if required.
 * @type {string}
 * @const
 */
VillageUtils.CSS_TRANSFORM = Modernizr.csstransforms ?
    /** @type {string}  */ (Modernizr.prefixed('transform')) : 'transform';

/**
 * True if transitions are supported by this browser.
 * @type {boolean}
 * @const
 */
VillageUtils.TRANSITIONS_SUPPORTED = Modernizr.csstransitions;

VillageUtils.once = function(func) {
  var ran = false, memo;
  return function() {
    if (ran) return memo;
    ran = true;
    memo = func.apply(this, arguments);
    func = null;
    return memo;
  };
};
