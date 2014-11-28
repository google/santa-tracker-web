/**
 * @fileoverview Spherical functions, copied from Maps API JS with little
 * modification.
 */

/**
 * Earth's radius in metres.
 * @const
 * @type {number}
 */
var EARTH_RADIUS = 6378137;

/**
 * @namespace Utility functions for computing geodesic angles, distances and
 * areas. The default radius is Earth's radius of 6378137 meters.
 */
var Spherical = {};

/**
 * Returns the heading from one LatLng to another LatLng. Headings are
 * expressed in degrees clockwise from North within the range [-180,180).
 * @param {LatLng} from
 * @param {LatLng} to
 * @return {number} heading The heading in degrees clockwise from north.
 */
Spherical.computeHeading = function(from, to) {
  // http://williams.best.vwh.net/avform.htm#Crs
  var fromLat = Spherical.degreesToRadians(from.lat);
  var fromLng = Spherical.degreesToRadians(from.lng);
  var toLat = Spherical.degreesToRadians(to.lat);
  var toLng = Spherical.degreesToRadians(to.lng);
  var dLng = toLng - fromLng;
  var heading = Math.atan2(
      Math.sin(dLng) * Math.cos(toLat),
      Math.cos(fromLat) * Math.sin(toLat) -
      Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng));
  return Spherical.wrap_(Spherical.radiansToDegrees(heading), -180, 180);
};

/**
 * Wraps the given value into the inclusive-exclusive interval between
 * min and max.
 * @param {number} value  The value to wrap.
 * @param {number} min  The minimum.
 * @param {number} max  The maximum.
 * @return {number}  The result.
 */
Spherical.wrap_ = function(value, min, max) {
  return Spherical.mod_(value - min, max - min) + min;
}

/**
 * Returns the non-negative remainder of x / m.
 * @param {number} x The operand.
 * @param {number} m The modulus.
 */
Spherical.mod_ = function(x, m) {
  return ((x % m) + m) % m;
}

/**
 * Converts from degrees to radians.
 *
 * @param {number} deg  Input degrees.
 * @return {number}  Result in radians.
 */
Spherical.degreesToRadians = function(deg) {
  // Make sure there are ( ) around PI/180 so that the JSCompiler
  // folds that constant.
  return deg * (Math.PI / 180);
}


/**
 * Converts from radians to degrees.
 *
 * @param {number} rad  Input in radians.
 * @return {number}  Result in degrees.
 */
Spherical.radiansToDegrees = function(rad) {
  return rad / (Math.PI / 180);
}

/**
 * Returns the LatLng which lies the given fraction of the way between the
 * origin LatLng and the destination LatLng.
 * @param {LatLng} from The LatLng from which to start.
 * @param {LatLng} to The LatLng toward which to travel.
 * @param {number} fraction A fraction of the distance to travel.
 * @return {LatLng} The interpolated LatLng.
 */
Spherical.interpolate = function(from, to, fraction) {
  // http://en.wikipedia.org/wiki/Slerp
  var fromLat = Spherical.degreesToRadians(from.lat);
  var fromLng = Spherical.degreesToRadians(from.lng);
  var toLat = Spherical.degreesToRadians(to.lat);
  var toLng = Spherical.degreesToRadians(to.lng);
  var cosFromLat = Math.cos(fromLat);
  var cosToLat = Math.cos(toLat);

  // Computes Spherical interpolation coefficients.
  var angle = Spherical.computeAngleBetween(from, to);
  var sinAngle = Math.sin(angle);
  if (sinAngle < 1E-6) {
    return from;
  }
  var a = Math.sin((1 - fraction) * angle) / sinAngle;
  var b = Math.sin(fraction * angle) / sinAngle;

  // Converts from polar to vector and interpolate.
  var x = a * cosFromLat * Math.cos(fromLng) +
          b * cosToLat * Math.cos(toLng);
  var y = a * cosFromLat * Math.sin(fromLng) +
          b * cosToLat * Math.sin(toLng);
  var z = a * Math.sin(fromLat) + b * Math.sin(toLat);

  // Converts interpolated vector back to polar.
  var lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  var lng = Math.atan2(y, x);
  return /** @type LatLng */ ({
    lat: Spherical.radiansToDegrees(lat),
    lng: Spherical.radiansToDegrees(lng)
  });
};


/**
 * Returns the angle between two LatLngs.
 * @param {LatLng} from
 * @param {LatLng} to
 * @return {number} Angle between the two LatLngs.
 */
Spherical.computeAngleBetween = function(from, to) {
  // Haversine's formula
  var fromLat = Spherical.degreesToRadians(from.lat);
  var fromLng = Spherical.degreesToRadians(from.lng);
  var toLat = Spherical.degreesToRadians(to.lat);
  var toLng = Spherical.degreesToRadians(to.lng);
  var dLat = fromLat - toLat;
  var dLng = fromLng - toLng;
  return 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((dLat) / 2), 2) +
                                 Math.cos(fromLat) * Math.cos(toLat) *
                                 Math.pow(Math.sin((dLng) / 2), 2)));
};

/**
 * Returns the distance between two LatLngs.
 * @param {LatLng} from
 * @param {LatLng} to
 * @param {number=} opt_radius
 * @return {number} Distance between the two LatLngs.
 */
Spherical.computeDistanceBetween = function(from, to, opt_radius) {
  var radius = opt_radius || EARTH_RADIUS;
  return Spherical.computeAngleBetween(from, to) * radius;
};
