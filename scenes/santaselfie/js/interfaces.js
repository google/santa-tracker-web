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

/* These objects are only used for documentation */



/**
 * @constructor
 * @param {!jQuery} $elem The container element
 */
app.GameObject = function($elem) {};


/**
 * Start will be called when the DOM elements have been created.
 * This is a good place to hook up events such as mouse handling.
 */
app.GameObject.prototype.start = function() {};


/**
 * Respond to mouse and touch events.
 * @param {!app.Mouse} mouse Global game mouse object
 */
app.GameObject.prototype.mouseChanged = function(mouse) {};
