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
 * @fileoverview Shared externs for Santa Tracker.
 * @externs
 */

/**
 * SantaApp is a generic way to fire miscellaneous events that matches the pre-2019 Polymer code.
 *
 * @const
 */
window.santaApp;

/**
 * @param {string} name event name
 * @param {...*} data event data
 */
window.santaApp.fire = function(name, ...data) {}

/**
 * @param {string} methodName
 * @param {...?} var_args
 * @return {?}
 */
function ga(methodName, var_args) {}

/**
 * @constructor
 */
function AnimationUtilTimeline() {};

/**
 * @public {number}
 */
AnimationUtilTimeline.prototype.playbackRate;

/**
 * @public {number}
 */
AnimationUtilTimeline.prototype.currentTime;

/**
 * @param {number} when
 * @param {!Element} el
 * @param {!Array<*>} steps
 * @param {number|!Object} timing
 * @return {!Animation}
 */
AnimationUtilTimeline.prototype.schedule = function(when, el, steps, timing) {};

/**
 * @param {number} when
 * @param {function(): void} fn
 */
AnimationUtilTimeline.prototype.call = function(when, fn) {};

/**
 * @param {!Animation} player
 */
AnimationUtilTimeline.prototype.remove = function(player) {};

/**
 */
AnimationUtilTimeline.prototype.removeAll = function() {};
