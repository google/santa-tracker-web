
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
'use strict';

goog.provide('app.EventEmitter');

// Object that can be exteded to handle event emitting
/**
 * @constructor
 */
app.EventEmitter = function() {
  this.listeners = {};
};

app.EventEmitter.prototype.addListener = function(label, callback) {
  if(!this.listeners.hasOwnProperty(label))
    this.listeners[label] = [];

  this.listeners[label].push(callback);
};

app.EventEmitter.prototype.isFunction = function(obj) {
  return typeof obj == 'function' || false;
};

app.EventEmitter.prototype.emit = function(label) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var listeners = this.listeners[label];

  if (listeners && listeners.length) {
    listeners.forEach(function (listener) {
      listener.apply(this, args);
    });
    return true;
  }
  return false;
};
