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
 * Simple events system.
 * @constructor
 */
function EventsManager() {
  /** @type {!Map<!Object, !Map<string, !Set<function(...*)>>>} */
  this.m_ = new Map();
};

/**
 * Gets or creates the events table for the specified object.
 * @param {!Object} o
 * @return {!Map<string, !Set<function(...*)>>}
 */
EventsManager.prototype.getTable_ = function(o) {
  let eventsTable = this.m_.get(o);
  if (!eventsTable) {
    eventsTable = new Map();
    this.m_.set(o, eventsTable);
  }
  return eventsTable;
};

/**
 * Adds a listener for an event on a target object.
 * @param {!Object} o
 * @param {string} eventName
 * @param {function(...*)} listener
 */
EventsManager.prototype.addListener = function(o, eventName, listener) {
  const eventsTable = this.getTable_(o);
  let listeners = eventsTable.get(eventName);
  if (!listeners) {
    listeners = new Set();
    eventsTable.set(eventName, listeners);
  }
  listeners.add(listener);
};

/**
 * Removes a listener for an event on a target object.
 * @param {!Object} o
 * @param {string} eventName
 * @param {function(...*)} listener
 * @return {boolean} true if removed
 */
EventsManager.prototype.removeListener = function(o, eventName, listener) {
  const eventsTable = this.getTable_(o);
  let listeners = eventsTable.get(eventName);
  return listeners ? listeners.delete(listener) : false;
};

/**
 * Triggers a given event on a target object.
 * @param {!Object} o
 * @param {string} eventName
 * @param {*=} var_args
 */
EventsManager.prototype.trigger = function(o, eventName, var_args) {
  const eventsTable = this.getTable_(o);
  const listeners = eventsTable.get(eventName);
  if (listeners) {
    const args = Array.prototype.slice.call(arguments, 2);  // past o, eventName
    listeners.forEach(cb => cb.apply(o, args));
  }
};

/**
 * Central Events handler.
 */
const Events = new EventsManager();
