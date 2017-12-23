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
 * @param {!Array<!SantaLocation>} array The route array.
 * @param {number} index Index of this location in the array.
 * @export
 */
SantaLocation = function SantaLocation(destination, array, index) {
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

  /** @private {!Array<!SantaLocation>} */
  this.array_ = array;

  /** @private {number} */
  this.index_ = index;

  /** @private {?number} */
  this.distanceTravelled_ = null;
}

/**
 * Total distance travelled in meters.
 *
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
 * @return {LatLng}
 * @export
 */
SantaLocation.prototype.getLocation = function() {
  return this.location;
};

/**
 * Returns the distance between this location and a given LatLng.
 *
 * @param {LatLng} to
 * @return {number} in meters
 * @export
 */
SantaLocation.prototype.distanceTo = function(to) {
  return Spherical.computeDistanceBetween(this.getLocation(), to);
};

/**
 * Whether this SantaLocation represents the North Pole. Just return for the first location, as
 * the last shouldn't be drawn twice.
 *
 * @return {boolean} whether this is the North Pole
 * @export
 */
SantaLocation.prototype.isNorthPole = function() {
  return this.index_ <= 0;
};

/**
 * @return {!SantaLocation} Santa's previous destination.
 * @export
 */
SantaLocation.prototype.prev = function() {
  return this.array_[this.index_ - 1] || this;
};

/**
 * @return {!SantaLocation} Santa's next destination.
 * @export
 */
SantaLocation.prototype.next = function() {
  return this.array_[this.index_ + 1] || this;
};

/**
 * @param {(LatLng|string|null|undefined)} s
 * @return {?LatLng}
 */
function parseLatLng(s) {
  if (!s) {
    return null;
  }

  /** @type {?LatLng} */
  let out = null;

  if (typeof s === 'object') {
    // support passing an existing LatLng object
    out = {
      lat: s.lat,
      lng: s.lng,
    };
  } else {
    const parts = s.split(',');
    if (parts.length !== 2) {
      return null;
    }
    out = {lat: +parts[0], lng: +parts[1]};
  }

  if (!isFinite(out.lat) || !isFinite(out.lng)) {
    return null;  // NaN or Infinity
  }
  return out;
}

const PRESENTS_OVER_WATER = .3;
const PRESENTS_IN_CITY = 1 - PRESENTS_OVER_WATER;

/**
 * @param {?LatLng} a
 * @param {?LatLng} b
 * @return {boolean} whether these are the same
 */
function latLngEqual(a, b) {
  if (!a) {
    return !b;
  }
  return a.lat === b.lat && a.lng === b.lng;
}

/**
 * @param {number} now
 * @param {SantaLocation} prev
 * @param {SantaLocation} stopover
 * @param {SantaLocation} next
 * @return {number}
 */
function calculatePresentsDelivered(now, prev, stopover, next) {
  if (!stopover) {
    const elapsed = now - prev.departure;
    const duration = next.arrival - prev.departure;
    const delivering = (next.presentsDelivered - prev.presentsDelivered) * PRESENTS_OVER_WATER;

    // While flying, deliver some of the quota.
    return Math.floor(prev.presentsDelivered + delivering * elapsed / duration);
  }

  const elapsed = now - stopover.arrival;
  const duration = (stopover.departure - stopover.arrival) || 1e-10;
  const delivering = stopover.presentsDelivered - prev.presentsDelivered;

  // While stopped, deliver remaining quota.
  return Math.floor(prev.presentsDelivered +
                    (delivering * PRESENTS_OVER_WATER) +
                    delivering * PRESENTS_IN_CITY * elapsed / duration);
}

/**
 * @param {number} now
 * @param {SantaLocation} prev
 * @param {SantaLocation} next
 * @return {number}
 */
function calculateDistanceTravelled(now, prev, next) {
  const elapsed = now - prev.departure;
  const travelTime = next.arrival - prev.departure;
  if (!travelTime) {
    return next.getDistanceTravelled();
  }
  const legLength = next.getDistanceTravelled() - prev.getDistanceTravelled();
  return prev.getDistanceTravelled() + (legLength * (elapsed / travelTime));
}