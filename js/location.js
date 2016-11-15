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

goog.provide('SantaLocation');

/**
 * SantaLocation represents a single Santa destination (e.g. Sydney).
 *
 * This constructor wraps a destination response from the server with
 * additional data and functions, like references to previous and next stops
 * within the route.
 *
 * @constructor
 * @param {!Object} destination Destination response from the server.
 * @param {function(string, function(SantaDetails))} fetchDetails
 * @param {!Array<!SantaLocation>} array The route array.
 * @param {number} index Index of this location in the array.
 * @export
 */
SantaLocation = function SantaLocation(destination, fetchDetails, array, index) {
  // We copy fields from destination onto this object. The fields are-
  // >> id, arrival, departure, presentsDelivered, population, city, region, location, details

  /** @export {string} */
  this.id = destination['id'];
  if (!this.id) {
    throw new Error('got no ID for SantaLocation');
  }

  /**
   * Santa's arrival time. Millis since unix epoch (suitable for use with Date constructor).
   * @export {number}
   */
  this.arrival = destination['arrival'];

 /**
  * Santa's departure time. Millis since unix epoch (suitable for use with Date constructor).
  * @export {number}
  */
  this.departure = destination['departure'];

  /** @export {number} */
  this.presentsDelivered = destination['presentsDelivered'];

  /** @export {number} */
  this.population = destination['population'];

  /** @export {string} */
  this.city = destination['city'];

  /** @export {string} */
  this.region = destination['region'];

  /** @export {LatLng} */
  this.location = destination['location'];

  /** @export {SantaDetails} */
  this.details = destination['details'];

  // Properties below are private and not from destination.

  /** @private {number} */
  this.lastFetchAttempt_ = 0;

  /** @private {!Array<function(SantaDetails)>} */
  this.queuedCallbacks_ = [];

  /** @private {function(string, function(SantaDetails))} */
  this.fetchDetails_ = fetchDetails;

  /** @private {!Array<!SantaLocation>} */
  this.array_ = array;

  /** @private {number} */
  this.index_ = index;

  /** @private {SantaDetails} */
  this.details_ = null;

  /** @private {?number} */
  this.distanceTravelled_ = null;
}

/**
 * Total distance travelled in metres.
 * @return {number}
 * @export
 */
SantaLocation.prototype.getDistanceTravelled = function() {
  if (this.distanceTravelled_ !== null) {
    return this.distanceTravelled_;
  }
  if (this.index_ == 0) {
    return this.distanceTravelled_ = 0;
  }
  // Recursive, yes, but even IE6 has a call stack limit of around 1000.
  const prev = this.prev();
  const dist = prev.getDistanceTravelled() + prev.distanceTo(this.getLocation());
  return this.distanceTravelled_ = dist;
};

/**
 * @param {function(SantaDetails)} callback
 * @export
 */
SantaLocation.prototype.getDetails = function(callback) {
  if (!callback) {
    return;
  }
  if (this.details_) {
    callback(this.details_);
  }
  this.queuedCallbacks_.push(callback);
  // Only fetch once every 10 seconds.
  if (new Date() - this.lastFetchAttempt_ < 10 * 1000) {
    // Too soon, junior.
    return;
  }
  this.lastFetchAttempt_ = +new Date();

  this.fetchDetails_(this.id, details => {
    this.details_ = details;
    for (let i = 0, cb; cb = this.queuedCallbacks_[i]; ++i) {
      cb(details);
    }
    this.queuedCallbacks_ = [];
  });
};

/**
 * @return {LatLng}
 * @export
 */
SantaLocation.prototype.getLocation = function() {
  return this.location;
};

/**
 * Returns the distance between this location and a given LatLng.
 * @param {LatLng} to
 * @return {number} in meters
 * @export
 */
SantaLocation.prototype.distanceTo = function(to) {
  return Spherical.computeDistanceBetween(this.getLocation(), to);
};

/**
 * @return {!SantaLocation} Santa's previous destination, or null
 * if there is no previous destination.
 * @export
 */
SantaLocation.prototype.prev = function() {
  return this.array_[this.index_ - 1] || this.array_[0];
};

/**
 * @return {!SantaLocation} Santa's next destination, or null if
 * there is no next destination.
 * @export
 */
SantaLocation.prototype.next = function() {
  return this.array_[this.index_ + 1] || this.array_[this.array_.length - 1];
};
