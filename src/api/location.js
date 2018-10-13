
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
    const update = destinations.map((raw, i) => new SantaLocation(raw, arr, i));
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
  getState(timestamp, userLocation = null, userDestination = null) {
    const destIndex = this._findDestinationIndex(timestamp);
    const dest = this.locations[destIndex];
    const dests = this.locations.slice(0, destIndex + 1);  // include dest in slice
    const next = dest.next || dest;
    const arrivalTime = userDestination ? userDestination.arrival : 0;
    const stream = this._findNearestStream(timestamp);

    if (timestamp < dest.departure) {
      // Santa is at this location.
      const position = dest.location;
      const distanceToUser =
          userLocation ? spherical.computeDistanceBetween(position, userLocation) : -1;
      return /** @type {!SantaState} */ ({
        position,
        heading: 0,
        presentsDelivered: calculatePresentsDelivered(timestamp, dest.prev || dest, dest, next),
        distanceTravelled: dest.distanceTravelled,
        distanceToUser,
        userDestination,
        arrivalTime,
        prev: dest.prev || dest,
        stopover: dest,
        next,
        dests,
        stream,
      });
    }

    // Santa is in transit.
    const travelTime = next.arrival - dest.departure;
    const elapsed = Math.max(timestamp - dest.departure, 0);
    const ratio = elapsed / travelTime;

    let currentLocation;
    if (userDestination && userLocation && dest.id === userDestination.id) {
      // If this is the segment where the user is, interpolate to them.
      const firstDistance = spherical.computeDistanceBetween(dest.location, userLocation);
      const secondDistance = spherical.computeDistanceBetween(userLocation, next.location);
      const along = (firstDistance + secondDistance) * ratio;
      if (along < firstDistance) {
        // Interpolate between the previous location and the user's location.
        const firstRatio = firstDistance ? (along / firstDistance) : 0;
        currentLocation = spherical.interpolate(dest.location, userLocation, firstRatio);
      } else {
        // Interpolate between the user's location and the upcoming location.
        const secondRatio = secondDistance ? ((along - firstDistance) / secondDistance) : 0;
        currentLocation = spherical.interpolate(userLocation, next.location, secondRatio);
      }
    } else {
      // Otherwise, interpolate between stops normally.
      currentLocation = spherical.interpolate(dest.location, next.location, ratio);
    }

    const distanceToUser =
        userLocation ? spherical.computeDistanceBetween(currentLocation, userLocation) : -1;
    return /** @type {!SantaState} */ ({
      position: currentLocation,
      heading: spherical.computeHeading(currentLocation, next.location),
      presentsDelivered: calculatePresentsDelivered(timestamp, dest, null, next),
      distanceTravelled: calculateDistanceTravelled(timestamp, dest, next),
      distanceToUser,
      userDestination,
      arrivalTime,
      prev: dest,
      stopover: null,
      next,
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
    const first = this.locations[0];
    if (!first || first.departure > timestamp) {
      return 0;  // not flying yet, assume at workshop
    }
    return sort.bisectLeft(this.locations, timestamp, (entry) => entry.departure);
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
  if (!stopover) {
    // Santa is flying between prev and next.
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
