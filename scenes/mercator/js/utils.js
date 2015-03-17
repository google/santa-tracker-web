/*global google*/

goog.provide('app.utils');

/**
 * Google maps utils.
 */
app.utils = {
  /**
   * Convert a point to a latitude and longitude.
   * @param {!google.maps.Map} map The Google map.
   * @param {!google.maps.Point} point The point to convert.
   * @return {!google.maps.LatLng} The latitude and longitude.
   */
  pointToLatLng: function(map, point) {
    var scale = Math.pow(2, map.getZoom());
    var normalizedPoint = new google.maps.Point(point.x / scale, point.y / scale);
    return map.getProjection().fromPointToLatLng(normalizedPoint);
  },

  /**
   * Convert a latitude and longitude to a point.
   * @param {!google.maps.Map} map The Google map.
   * @param {!google.maps.LatLng} latLng The latitude and longitude to convert.
   * @return {!google.maps.Point} The point.
   */
  latLngToPoint: function(map, latLng) {
    var point = map.getProjection().fromLatLngToPoint(latLng);
    var scale = Math.pow(2, map.getZoom());
    return new google.maps.Point(point.x * scale, point.y * scale);
  }
};
