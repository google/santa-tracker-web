/*
 * Copyright 2016 Google Inc. All rights reserved.
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
 * @fileoverview Externs for Klang. This is not exhaustive, it's just for SoundController.
 * @externs
 */


/**
 */
var Klang;

/**
 * @param {string} config
 * @param {function(boolean)} callback
 */
Klang.init = function(config, callback) {};

/**
 */
Klang.initIOS = function() {};

/**
 * @param {string} eventName
 * @param {...*} var_args
 */
Klang.triggerEvent = function(eventName, var_args) {};

/** @type {string} */
Klang.engineVersion;
