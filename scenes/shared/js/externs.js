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
 * SantaApp is actually the Polymer <santa-app>. It's used to dispatch global
 * events.
 *
 * @const
 */
window.santaApp;

/**
 * @param {string} name event name
 * @param {*} data event data
 */
window.santaApp.fire = function(name, data) {}

/**
 * @const
 */
var Modernizr;

/**
 * @type {boolean}
 */
Modernizr.touch;

/**
 * TODO(thorogood): Migrate to Animation as per-
 *   https://developers.google.com/web/updates/2015/04/web-animations-naming?hl=en
 * @constructor
 */
var AnimationPlayer = function() {};

/**
 * @type {!Promise|boolean}
 */
AnimationPlayer.prototype.finished;

/**
 * @param {string} type
 * @param {!Function} listener
 * @param {boolean} useCapture
 */
AnimationPlayer.prototype.addEventListener = function(type, listener, useCapture) {};

/**
 * @type {string}
 */
AnimationPlayer.prototype.playState;
