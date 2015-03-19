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
 * SantaLocation represents a single Santa destination (e.g. Sydney).
 *
 * This constructor wraps a destination response from the server with
 * additional data and functions, like references to previous and next stops
 * within the route.
 *
 * @constructor
 * @param {Object} destination Destination response from the server.
 * @param {!Array.<!SantaLocation>} array The route array.
 * @param {number} index Index of this location in the array.
 * @param {Function} fetchDetails
 */
function SantaLocation(destination, fetchDetails, array, index) {
  // populate with all of the properties from the server.
  $.extend(this, destination);

  /**
   * @private
   * @type {number}
   */
  this.lastFetchAttempt_ = 0;

  /**
   * @private
   * @type {!Array.<!Function>}
   */
  this.queuedCallbacks_ = [];

  this.fetchDetails_ = fetchDetails;

  this.array_ = array;
  this.index_ = index;

  /**
   * @type {SantaDetails}
   */
  this.details_ = null;

  /**
   * @type {number|null}
   */
  this.distanceTravelled_ = null;

  /**
   * The number of presents delivered within this stop. It's 70% of the total
   * presents delivered between this stop and the next. The remaining 30% are
   * delivered while he's flying.
   *
   * @type {number}
   */
  this.presentsDeliveredInCity = Math.floor(
      (this.presentsDelivered - this.prev().presentsDelivered) *
      SantaService.prototype.PRESENTS_IN_CITY);
}

/**
 * Total distance travelled in metres.
 * @return {number}
 */
SantaLocation.prototype.getDistanceTravelled = function() {
  if (this.distanceTravelled_ !== null) {
    return this.distanceTravelled_;
  }
  if (this.index_ == 0) {
    return this.distanceTravelled_ = 0;
  }
  // Recursive, yes, but even IE6 has a call stack limit of around 1000.
  var dist = this.prev().getDistanceTravelled();
  dist += this.prev().distanceTo(this.getLocation());
  return this.distanceTravelled_ = dist;
};

/**
 * @param {function(SantaDetails)} callback
 */
SantaLocation.prototype.getDetails = function(callback) {
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

  var that = this;
  this.fetchDetails_(this.id, function(details) {
    that.details_ = details;
    for (var i = 0; i < that.queuedCallbacks_.length; i++) {
      that.queuedCallbacks_[i] && that.queuedCallbacks_[i](details);
    }
    that.queuedCallbacks_ = [];
  });
};

/**
 * @return {LatLng}
 */
SantaLocation.prototype.getLocation = function() {
  return this['location'];
};

/**
 * Returns the distance between this location and a given LatLng.
 * @param {LatLng} to
 * @return {number} in metres
 */
SantaLocation.prototype.distanceTo = function(to) {
  return Spherical.computeDistanceBetween(this.getLocation(), to);
};

/**
 * @return {!SantaLocation} Santa's previous destination, or null
 * if there is no previous destination.
 */
SantaLocation.prototype.prev = function() {
  return this.array_[this.index_ - 1] || this.array_[0];
};

/**
 * @return {!SantaLocation} Santa's next destination, or null if
 * there is no next destination.
 */
SantaLocation.prototype.next = function() {
  return this.array_[this.index_ + 1] || this.array_[this.array_.length - 1];
};

/**
 * Santa's arrival time.
 * Millis since unix epoch (suitable for use with Date constructor).
 * @type number
 */
SantaLocation.prototype.arrival;

/**
 * Santa's departure time.
 * Millis since unix epoch (suitable for use with Date constructor).
 * @type number
 */
SantaLocation.prototype.departure;

/**
 * @type {number}
 */
SantaLocation.prototype.presentsDelivered;

/**
 * @type {number}
 */
SantaLocation.prototype.population;

/**
 * @type {string}
 */
SantaLocation.prototype.city;

/**
 * @type {string}
 */
SantaLocation.prototype.region;

/**
 * @type {string}
 */
SantaLocation.prototype.id;
