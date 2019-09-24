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

goog.provide('app.Country');

goog.require('app.utils');

/**
 * The country object.
 * @param {!google.maps.Map} map A Google map.
 * @param {!Object} feature The data for the country from GeoJSON.
 * @param {boolean} geodesic Is the polygon geodesic?
 * @constructor
 */
app.Country = function(map, feature, geodesic) {
  this.map = map;
  this.paths = feature.geometry.coordinates.map(function(path) {
    if (Array.isArray(path)) {
      path = path[0];
    }
    return google.maps.geometry.encoding.decodePath(path);
  });

  this.visible = false;
  this.matched = false;
  this.name = feature.properties.name_long;
  this.geodesic = geodesic;
  this.startPoint_ = null;

  this.polygon = new google.maps.Polygon({
    map: null,
    paths: this.paths,
    strokeOpacity: 1,
    strokeWeight: 1,
    fillOpacity: 0.5,
    draggable: true,
    geodesic: geodesic,
    zIndex: 3
  });

  var bounds = new google.maps.LatLngBounds();
  this.paths.forEach(function(path) {
    if (!Array.isArray(path)) {
      path = [path];
    }
    path.forEach(bounds.extend.bind(bounds));
  });
  this.bounds = bounds;

  google.maps.event.addListener(this.polygon, 'dragstart', this.onDragStart_.bind(this));
  google.maps.event.addListener(this.polygon, 'dragend', this.onDragEnd_.bind(this));
};

/**
 * Show the country.
 * @param {string} color The color it should have.
 */
app.Country.prototype.show = function(color) {
  this.color = color;
  this.polygon.setOptions({
    strokeColor: color,
    fillColor: color
  });
  this.polygon.setMap(this.map);
  this.visible = true;
};

/**
 * Hide the country.
 */
app.Country.prototype.hide = function() {
  this.polygon.setMap(null);
  this.visible = false;
};

/**
 * Set the position of the country on the map.
 * @param {!google.maps.Point} point A Google maps point.
 */
app.Country.prototype.setPosition = function(point) {
  var center = this.bounds.getCenter();
  var paths;
  if (!this.geodesic) {
    paths = app.utils.moveToPoint(this.map, center, this.paths, point);
  } else {
    paths = app.utils.moveToGeodesic(this.map, center, this.paths, point);
  }
  this.polygon.setPaths(paths);
  this.startPoint_ = point;
};

/**
 * Called when a country is matched.
 */
app.Country.prototype.onMatched = function() {};

/**
 * Called when a country is dragged.
 */
app.Country.prototype.onDrag = function() {};

/**
 * Draw the bounds of the country. Used for debugging.
 */
app.Country.prototype.showBounds = function() {
  this.debugBounds && this.debugBounds.setMap(null);
  this.debugBounds = new google.maps.Rectangle({
    map: this.map,
    bounds: this.bounds,
    zIndex: 1
  });
};

/**
 * Country dragged event handler.
 * @private
 */
app.Country.prototype.onDragStart_ = function() {
  window.santaApp.fire('sound-trigger', 'mercator_pickup');
  this.onDrag();
};

/**
 * Google Maps event handler for drag end.
 * @private
 */
app.Country.prototype.onDragEnd_ = function() {
  const paths = this.polygon.getPaths().getArray();
  const bounds = new google.maps.LatLngBounds();
  paths.forEach((path) => path.getArray().forEach((latlng) => bounds.extend(latlng)));
  const center = bounds.getCenter();

  let point = null;
  if (isNaN(center.lat()) || isNaN(center.lng())) {
    point = this.startPoint_;
  }

  if (this.geodesic) {
    // On drag end, reposition the country. This is because our geodesic projection code doesn't
    // exactly match the code used by the Google Maps API internally to do dragging. This way, as
    // the country gets closer to its final location, it'll "straighten up".
    point = app.utils.latLngToPoint(this.map, center);
  } else if (!this.map.getBounds().contains(center)) {
    // If we're out of bounds, reset to start point. This doesn't happen in geodesic mode, as that
    // is showing the whole Earth.
    point = this.startPoint_;
  }

  point && this.setPosition(point);

  if (!this.isMatching()) {
    window.santaApp.fire('sound-trigger', 'mercator_place');
    return;
  }

  this.polygon.setOptions({
    draggable: false,
    fillOpacity: 0.75,
    zIndex: 2,
  });
  this.polygon.setOptions({geodesic: false});
  this.polygon.setPaths(this.paths);

  this.matched = true;
  this.onMatched && this.onMatched(this);
  window.santaApp.fire('sound-trigger', 'mercator_success');
};

/**
 * Builds a hitbox. This changes size based on the screen size, so can be generated dynamically.
 * @param {number=} pixels to grow by
 * @return {google.maps.LatLngBounds}
 */
app.Country.prototype.buildHitbox_ = function(pixels = app.Constants.HITBOX_SIZE) {
  var ne = app.utils.latLngToPoint(this.map, this.bounds.getNorthEast());
  var sw = app.utils.latLngToPoint(this.map, this.bounds.getSouthWest());

  ne.x += pixels;
  ne.y -= pixels;
  sw.x -= pixels;
  sw.y += pixels;

  var hitbox = new google.maps.LatLngBounds();
  hitbox.extend(app.utils.pointToLatLng(this.map, ne));
  hitbox.extend(app.utils.pointToLatLng(this.map, sw));
  return hitbox;
};

/**
 * Check if the country is in the correct position.
 * @return {boolean} Is the country matching?
 */
app.Country.prototype.isMatching = function() {
  var paths = this.polygon.getPaths().getArray();
  var hitbox = this.buildHitbox_();

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i].getArray();
    for (var j = 0; j < path.length; j++) {
      if (!hitbox.contains(path[j])) {
        return false;
      }
    }
  }

  return true;
};
