/*
 * Copyright 2017 Google Inc. All rights reserved.
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
 * @fileoverview
 * Route helper.
 */

goog.provide('Route');

/**
 * @param {!Array<!Object>} raw
 * @return {!Array<!StreamUpdate>}
 */
function buildStream(raw) {
  const out = [];
  const valid = ['didyouknow', 'status', 'update'];

  function findValid(cand) {
    for (let i = 0; i < valid.length; ++i) {
      const t = valid[i];
      if (t in cand && cand[t]) {
        return t;
      }
    }
    return null;
  }

  raw.forEach((cand) => {
    if (!cand.timestamp) {
      return;
    }
    const type = findValid(cand);
    if (!type) {
      return;  // old-style stream that we don't care about
    }

    const update = /** @type {!StreamUpdate} */ ({
      timestamp: /** @type {number} */ (cand.timestamp),
      type: type,
      message: /** @type {string} */ (cand[type]),
    });
    out.push(update);
  });

  return out;
}

/**
 * @export
 */
const Route = class Route {
  /**
   * @param {!Object<string, *>} data
   */
  constructor(url, data) {
    /** @type {string} */
    this.url = url;

    /** @type {!Array<!StreamUpdate>} */
    this.stream_ = buildStream(/** @type {!Array<!Object>} */ (data['stream']));

    const destinations = /** @type {!Array<!Object>} */ (data['destinations']) || [];
    const arr = [];
    const update = destinations.map((raw, i) => new SantaLocation(raw, arr, i));
    arr.push(...update);

    /**
     * @export @const @type {!Array<!SantaLocation>}
     */
    this.locations = arr;
    if (!this.locations.length) {
      console.warn('got bad data', data);
      throw new Error('no destinations for Santa');
    }
  }

  /**
   * @param {?LatLng} p position to find nearest location to
   * @param {number=} limit for search in meters
   * @return {SantaLocation} nearest location
   * @export
   */
  nearestDestinationTo(p, limit=1000 * 1000) {
    if (!p) {
      return null;
    }

    // We don't optimize this overly much, because it should only be called once on each load.

    let best = Infinity;
    let cand = null;

    const l = this.locations.length;
    for (let i = 0; i < l; ++i) {
      const c = this.locations[i];
      if (Math.abs(p.lat - c.location.lat) > 10) {
        continue;  // too far out, assume >10deg is too much
      }

      const dist = Spherical.computeDistanceBetween(p, c.location);
      if (dist > limit || dist >= best) {
        continue;  // outside threshold
      }

      best = dist;
      cand = c;
    }

    return cand;
  }

  /**
   * Return the SantaState object for the current time.
   *
   * @param {number} timestamp
   * @param {?LatLng=} userLocation
   * @param {SantaLocation=} nearestDestination
   * @return {SantaState}
   * @export
   */
  getState(timestamp, userLocation = null, nearestDestination = null) {
    const destIndex = this.findDestinationIndex_(timestamp);
    const dest = this.locations[destIndex];
    const dests = this.locations.slice(0, destIndex + 1);  // include dest in slice
    const next = dest.next();
    const arrivalTime = nearestDestination ? nearestDestination.arrival : 0;
    const stream = this.findStream_(timestamp);

    if (timestamp < dest.departure) {
      // Santa is at this location.
      const position = dest.getLocation();
      const distanceToUser =
          userLocation ? Spherical.computeDistanceBetween(position, userLocation) : -1;
      return /** @type {SantaState} */ ({
        position: position,
        presentsDelivered: calculatePresentsDelivered(timestamp, dest.prev(), dest, next),
        distanceTravelled: dest.getDistanceTravelled(),
        distanceToUser: distanceToUser,
        arrivalTime: arrivalTime,
        heading: 0,
        prev: dest.prev(),
        stopover: dest,
        next: next,
        dests: dests,
        stream: stream,
      });
    }

    // Santa is in transit.
    const travelTime = next.arrival - dest.departure;
    const elapsed = Math.max(timestamp - dest.departure, 0);
    const ratio = elapsed / travelTime;

    let currentLocation;
    if (nearestDestination && userLocation && dest.id === nearestDestination.id) {
      // If this is the segment where the user is, interpolate to them.
      const firstDistance = Spherical.computeDistanceBetween(dest.getLocation(), userLocation);
      const secondDistance = Spherical.computeDistanceBetween(userLocation, next.getLocation());
      const along = (firstDistance + secondDistance) * ratio;
      if (along < firstDistance) {
        // Interpolate between the previous location and the user's location.
        const firstRatio = firstDistance ? (along / firstDistance) : 0;
        currentLocation = Spherical.interpolate(dest.getLocation(), userLocation, firstRatio);
      } else {
        // Interpolate between the user's location and the upcoming location.
        const secondRatio = secondDistance ? ((along - firstDistance) / secondDistance) : 0;
        currentLocation = Spherical.interpolate(userLocation, next.getLocation(), secondRatio);
      }
    } else {
      // Otherwise, interpolate between stops normally.
      currentLocation = Spherical.interpolate(
          dest.getLocation(),
          next.getLocation(),
          elapsed / travelTime);
    }

    const distanceToUser =
        userLocation ? Spherical.computeDistanceBetween(currentLocation, userLocation) : -1;
    return /** @type {SantaState} */ ({
      position: currentLocation,
      heading: Spherical.computeHeading(currentLocation, next.getLocation()),
      presentsDelivered: calculatePresentsDelivered(timestamp, dest, null, next),
      distanceTravelled: calculateDistanceTravelled(timestamp, dest, next),
      distanceToUser: distanceToUser,
      arrivalTime: arrivalTime,
      prev: dest,
      stopover: null,
      next: next,
      dests: dests,
      stream: stream,
    });
  }

  /**
   * @param {number} timestamp
   * @return {StreamUpdate} closest stream entry, or null
   */
  findStream_(timestamp) {
    const sl = this.stream_.length;
    for (let i = 0; i < sl; ++i) {
      const cand = this.stream_[i];
      if (timestamp <= cand.timestamp) {
        return cand;
      }
    }
    return this.stream_[sl - 1] || null;
  }

  /**
   * @param {number} timestamp
   * @return {number} index of location
   */
  findDestinationIndex_(timestamp) {
    const first = this.locations[0];
    if (first.departure > timestamp) {
      return 0;  // not flying yet, assume at workshop
    }

    let i;
    const ll = this.locations.length;
    for (i = 0; i < ll; ++i) {
      const dest = this.locations[i];
      if (timestamp < dest.arrival) {
        break;
      }
    }
    return Math.max(0, i - 1);
  }
}