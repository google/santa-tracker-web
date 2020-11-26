/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import * as spherical from './spherical.js';
import * as sort from './sort.js';


const PRESENTS_OVER_WATER = .3;
const PRESENTS_IN_CITY = 1 - PRESENTS_OVER_WATER;


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
export class SantaLocation {
  constructor(destination, array, index) {
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

    /** @export {!LatLng} */
    this.location = destination['location'];

    /** @export {!SantaDetails} */
    this.details = destination['details'];

    // Properties below are private and not from destination.

    /** @private {!Array<!SantaLocation>} */
    this._array = array;

    /** @private {number} */
    this._index = index;

    /** @private {?number} */
    this._distanceTravelled = null;
  }

  /**
   * Total distance travelled in meters.
   *
   * @return {number}
   * @export
   */
  get distanceTravelled() {
    if (this._distanceTravelled !== null) {
      return this._distanceTravelled;
    }
    // Recursive, yes, but even IE6 has a call stack limit of around 1000.
    const prev = this.prev;
    if (prev === null) {
      return this._distanceTravelled = 0;
    }
    const dist = prev.distanceTravelled + prev.distanceTo(this.location);
    return this._distanceTravelled = dist;
  }

  /**
   * Returns the distance between this location and a given LatLng.
   *
   * @param {LatLng} to
   * @return {number} in meters
   * @export
   */
  distanceTo(to) {
    return spherical.computeDistanceBetween(this.location, to);
  }

  /**
   * Whether this SantaLocation represents the North Pole. Just return for the first location, as
   * the last shouldn't be drawn twice.
   *
   * @return {boolean} whether this is the North Pole
   * @export
   */
  get isNorthPole() {
    return this.prev === null;
  }

  /**
   * @return {?SantaLocation} Santa's previous destination.
   * @export
   */
  get prev() {
    return this._array[this._index - 1] || null;
  }

  /**
   * @return {?SantaLocation} Santa's next destination.
   * @export
   */
  get next() {
    return this._array[this._index + 1] || null;
  }
}


export class Route {

  /**
   * @param {string} url
   * @param {!Object<string, *>} data
   */
  constructor(url, data) {
    this.url = url;

    /** @type {!Array<!StreamUpdate>} */
    this._stream = buildStream(/** @type {!Array<!Object>} */ (data['stream']));

    const destinations = /** @type {!Array<!Object>} */ (data['destinations']) || [];
    const arr = [];
    const update = destinations.map((raw, i) => {
      // nb. There should not be any bad data, but act defensively.
      if (raw['departure'] < raw['arrival'] && i !== destinations.length - 1) {
        raw['departure'] = raw['arrival'];  // departure is >= arrival
      }
      return new SantaLocation(raw, arr, i)
    });
    arr.push(...update);

    /**
     * @export {!Array<!SantaLocation>}
     */
    this.locations = arr;
  }

  /**
   * @param {?LatLng} p position to find nearest location to
   * @param {number=} limit for search in meters, default 1000km
   * @return {SantaLocation} nearest location
   * @export
   */
  nearestDestinationTo(user, limit=1000 * 1000) {
    if (!user) {
      return null;
    }

    // We don't optimize this overly much, because it should only be called once on each load.

    let best = Infinity;
    let cand = null;

    const all = this.locations;
    const l = all.length;
    for (let i = 0; i < l; ++i) {
      const test = all[i];
      if (Math.abs(user.lat - test.location.lat) > 15) {
        continue;  // too far out, assume >15deg is too much
      }

      const dist = spherical.computeDistanceBetween(user, test.location);
      if (dist > limit || dist >= best) {
        continue;  // outside threshold
      }

      best = dist;
      cand = test;
    }

    return cand;
  }

  /**
   * Return the SantaState object for the current time.
   *
   * @param {number} timestamp
   * @param {?LatLng=} userLocation
   * @param {?SantaLocation=} userDestination
   * @return {!SantaState}
   * @export
   */
  getState(timestamp, userLocation=null, userDestination=null) {
    const destIndex = this._findDestinationIndex(timestamp);
    const dest = this.locations[destIndex];
    const dests = this.locations.slice(0, destIndex);  // do not include dest in slice
    const arrivalTime = userDestination ? userDestination.arrival : 0;
    const stream = this._findNearestStream(timestamp);

    if (timestamp >= dest.arrival || dest.prev === null) {
      dests.push(dest);

      // Santa is at `dest`.
      const position = dest.location;
      const distanceToUser =
          userLocation ? spherical.computeDistanceBetween(position, userLocation) : -1;
      return /** @type {!SantaState} */ ({
        position,
        heading: 0,
        presentsDelivered: calculatePresentsDelivered(timestamp, dest.prev, dest, dest.next),
        distanceTravelled: dest.distanceTravelled,
        distanceToUser,
        userDestination,
        arrivalTime,
        prev: dest.prev,
        stopover: dest,
        next: dest.next,
        dests,
        stream,
      });
    }

    // Santa is in transit.
    const {prev} = dest;
    const travelTime = dest.arrival - prev.departure;
    const elapsed = Math.max(timestamp - prev.departure, 0);
    const ratio = elapsed / travelTime;

    let currentLocation;
    if (userDestination && userLocation && dest.id === userDestination.id) {
      // If this is the segment where the user is, interpolate to them.
      const firstDistance = spherical.computeDistanceBetween(prev.location, userLocation);
      const secondDistance = spherical.computeDistanceBetween(userLocation, dest.location);
      const along = (firstDistance + secondDistance) * ratio;
      if (along < firstDistance) {
        // Interpolate between the previous location and the user's location.
        const firstRatio = firstDistance ? (along / firstDistance) : 0;
        currentLocation = spherical.interpolate(prev.location, userLocation, firstRatio);
      } else {
        // Interpolate between the user's location and the destination.
        const secondRatio = secondDistance ? ((along - firstDistance) / secondDistance) : 0;
        currentLocation = spherical.interpolate(userLocation, dest.location, secondRatio);
      }
    } else {
      // Otherwise, interpolate between stops normally.
      currentLocation = spherical.interpolate(prev.location, dest.location, ratio);
    }

    const distanceToUser =
        userLocation ? spherical.computeDistanceBetween(currentLocation, userLocation) : -1;
    return /** @type {!SantaState} */ ({
      position: currentLocation,
      heading: spherical.computeHeading(currentLocation, dest.location),
      presentsDelivered: calculatePresentsDelivered(timestamp, prev, null, dest),
      distanceTravelled: calculateDistanceTravelled(timestamp, prev, dest),
      distanceToUser,
      userDestination,
      arrivalTime,
      prev: dest.prev,
      stopover: null,
      next: dest,
      dests,
      stream,
    });
  }

  /**
   * @param {number} timestamp
   * @return {?StreamUpdate} closest stream entry, or null
   */
  _findNearestStream(timestamp) {
    const index = sort.bisectLeft(this._stream, timestamp, (entry) => entry.timestamp);
    return this._stream[index] || null;
  }

  /**
   * @param {number} timestamp
   * @return {number} index of location
   */
  _findDestinationIndex(timestamp) {
    const locations = this.locations;
    const first = locations[0];
    if (!first || first.departure > timestamp) {
      return 0;  // not flying yet, assume at workshop
    }
    const index = sort.bisectLeft(locations, timestamp, (entry) => entry.departure);
    if (index >= locations.length) {
      return locations.length - 1;
    }
    return index;
  }
}


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
 * @param {(?LatLng|string|null|undefined)} s
 * @return {?LatLng}
 */
export function parseLatLng(s) {
  if (!s) {
    return null;
  }

  /** @type {?LatLng} */
  let out = null;

  if (typeof s === 'object') {
    // support passing an existing LatLng object
    out = {
      lat: +s.lat,
      lng: +s.lng,
    };
  } else if (typeof s === 'string') {
    const parts = s.split(',');
    if (parts.length !== 2) {
      return null;
    }
    out = {lat: +parts[0], lng: +parts[1]};
  } else {
    return null;
  }

  if (!isFinite(out.lat) || !isFinite(out.lng)) {
    return null;  // NaN or Infinity
  }
  return out;
}


/**
 * @param {number} now
 * @param {!SantaLocation} prev
 * @param {?SantaLocation} stopover
 * @param {!SantaLocation} next
 * @return {number}
 */
export function calculatePresentsDelivered(now, prev, stopover, next) {
  if (next === null) {
    if (stopover !== null) {
      // nb. only happens at landing, which has no gifts
      return stopover.presentsDelivered;
    } else if (prev !== null) {
      return prev.presentsDelivered;
    }
  }
  if (prev === null) {
    return 0;
  }

  if (!stopover) {
    // Santa is flying between prev and next.
    const elapsed = now - prev.departure;
    const duration = next.arrival - prev.departure;

    let delivering = (next.presentsDelivered - prev.presentsDelivered);
    if (next.next === null) {
      // The next stop is the final stop, so deliver all the presents before Santa arrives: don't
      // adjust by PRESENTS_OVER_WATER, which reduces the amount so that we can deliver at city.
    } else {
      delivering *= PRESENTS_OVER_WATER;
    }

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
 * @param {!SantaLocation} prev
 * @param {!SantaLocation} next
 * @return {number}
 */
export function calculateDistanceTravelled(now, prev, next) {
  const elapsed = now - prev.departure;
  const travelTime = next.arrival - prev.departure;
  if (!travelTime) {
    return next.distanceTravelled;
  }
  const legLength = spherical.computeDistanceBetween(next.location, prev.location);
  return prev.distanceTravelled + (legLength * (elapsed / travelTime));
}
