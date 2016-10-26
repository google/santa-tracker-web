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
  },

  /**
   * Move a non geodesic polygon to a point location.
   * @param {google.maps.Map} map The Google map.
   * @param {google.maps.LatLng} center The center of the polygon.
   * @param {!Array<!Array<!google.maps.LatLng>>} paths All the paths in the polygon.
   * @param {{x: number, y: number}} point The point to move to.
   */
  moveToPoint: function(map, center, paths, point) {
    var centerPoint = app.utils.latLngToPoint(map, center);
    var dX = point.x - centerPoint.x;
    var dY = point.y - centerPoint.y;

    return paths.map(function(path) {
      return path.map(function(latLng) {
        var pathPoint = app.utils.latLngToPoint(map, latLng);
        pathPoint.x += dX;
        pathPoint.y += dY;
        return app.utils.pointToLatLng(map, pathPoint);
      });
    });
  },

  /**
   * Move a geodesic polygon to a latitude and longitude.
   * @param {google.maps.Map} map The Google map.
   * @param {google.maps.LatLng} center The center of the polygon.
   * @param {!Array<!Array<!google.maps.LatLng>>} paths All the paths in the polygon.
   * @param {google.maps.LatLng} latLng The latitude and longitude to move to.
   */
  moveToGeodesic: function(map, center, paths, latLng) {
    return paths.map(function(path) {
      return path.map(function(point) {
        return google.maps.geometry.spherical.computeOffset(
          latLng,
          google.maps.geometry.spherical.computeDistanceBetween(center, point),
          google.maps.geometry.spherical.computeHeading(center, point)
        );
      });
    });
  },
};
