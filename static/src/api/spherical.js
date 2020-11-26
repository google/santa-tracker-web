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


/**
 * @fileoverview Spherical functions, copied from Maps API JS with little modification.
 */


/**
 * Earth's radius in meters.
 *
 * @const {number}
 */
const EARTH_RADIUS = 6378137;


/**
 * Math.PI by 180, for deg <=> rad conversion.
 *
 * @const {number}
 */
const PI_BY_180 = Math.PI / 180;


/**
 * Mod helper to deal with JavaScript's failings.
 *
 * @param {number} x
 * @param {number} m
 * @return {number}
 */
function mod(x, m) {
  return ((x % m) + m) % m;
}


/**
 * Wraps the given value into the inclusive-exclusive interval between min and max.
 *
 * @param {number} value The value to wrap.
 * @param {number} min The minimum.
 * @param {number} max The maximum.
 * @return {number} The result.
 */
function wrap(value, min, max) {
  return mod(value - min, max - min) + min;
}


/**
 * Converts from degrees to radians.
 *
 * @param {number} deg Input degrees.
 * @return {number} Result in radians.
 */
export function degreesToRadians(deg) {
  return deg * PI_BY_180;
}


/**
 * Converts from radians to degrees.
 *
 * @param {number} rad Input radians.
 * @return {number} Result in degrees.
 */
export function radiansToDegrees(rad) {
  return rad / PI_BY_180;
}


/**
 * Returns the heading from one LatLng to another LatLng. Headings are expressed in degrees
 * clockwise from North within the range [-180,180).
 *
 * @param {LatLng} from
 * @param {LatLng} to
 * @return {number} The heading in degrees clockwise from north.
 * @export
 */
export function computeHeading(from, to) {
  // https://www.edwilliams.org/avform.htm#Crs
  const fromLat = degreesToRadians(from.lat);
  const fromLng = degreesToRadians(from.lng);
  const toLat = degreesToRadians(to.lat);
  const toLng = degreesToRadians(to.lng);
  const dLng = toLng - fromLng;
  const heading = Math.atan2(
      Math.sin(dLng) * Math.cos(toLat),
      Math.cos(fromLat) * Math.sin(toLat) -
      Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng));
  return wrap(radiansToDegrees(heading), -180, 180);
}


/**
 * Returns the LatLng which lies the given fraction of the way between the origin LatLng and the
 * destination LatLng.
 *
 * @param {LatLng} from The LatLng from which to start.
 * @param {LatLng} to The LatLng toward which to travel.
 * @param {number} fraction A fraction of the distance to travel.
 * @return {LatLng} The interpolated LatLng.
 */
export function interpolate(from, to, fraction) {
  // http://en.wikipedia.org/wiki/Slerp
  const fromLat = degreesToRadians(from.lat);
  const fromLng = degreesToRadians(from.lng);
  const toLat = degreesToRadians(to.lat);
  const toLng = degreesToRadians(to.lng);
  const cosFromLat = Math.cos(fromLat);
  const cosToLat = Math.cos(toLat);

  // Computes spherical interpolation coefficients.
  const angle = computeAngleBetween(from, to);
  const sinAngle = Math.sin(angle);
  if (sinAngle < 1E-6) {
    return from;  // too small to be relevant
  }
  const a = Math.sin((1 - fraction) * angle) / sinAngle;
  const b = Math.sin(fraction * angle) / sinAngle;

  // Converts from polar to vector and interpolate.
  const x = a * cosFromLat * Math.cos(fromLng) + b * cosToLat * Math.cos(toLng);
  const y = a * cosFromLat * Math.sin(fromLng) + b * cosToLat * Math.sin(toLng);
  const z = a * Math.sin(fromLat) + b * Math.sin(toLat);

  // Converts interpolated vector back to polar.
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);
  return {
    lat: radiansToDegrees(lat),
    lng: radiansToDegrees(lng),
  };
}


/**
 * Returns the angle between two LatLngs.
 *
 * @param {LatLng} from
 * @param {LatLng} to
 * @return {number} Angle between the two locations, in radians.
 */
export function computeAngleBetween(from, to) {
  // the haversine formula
  const fromLat = degreesToRadians(from.lat);
  const fromLng = degreesToRadians(from.lng);
  const toLat = degreesToRadians(to.lat);
  const toLng = degreesToRadians(to.lng);
  const dLat = fromLat - toLat;
  const dLng = fromLng - toLng;
  return 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((dLat) / 2), 2) +
                                 Math.cos(fromLat) * Math.cos(toLat) *
                                 Math.pow(Math.sin((dLng) / 2), 2)));
}


/**
 * Returns the distance between two LatLngs.
 *
 * @param {LatLng} from
 * @param {LatLng} to
 * @param {number=} radius The radius to use (in meters), or Earth's estimated radius.
 * @return {number} Distance between the two LatLngs in meters.
 */
export function computeDistanceBetween(from, to, radius = EARTH_RADIUS) {
  return computeAngleBetween(from, to) * radius;
}
