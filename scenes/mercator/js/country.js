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
  this.correctPaths = this.paths;
  this.visible = false;
  this.matched = false;
  this.name = feature.properties.name_long;
  this.geodesic = geodesic;

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

  this.getBounds_();

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
    var latLng = app.utils.pointToLatLng(this.map, point);
    paths = app.utils.moveToGeodesic(this.map, center, this.paths, latLng);
  }
  this.polygon.setPaths(paths);
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
 * Calculate the bounds of the country.
 * @private
 */
app.Country.prototype.getBounds_ = function() {
  var bounds = new google.maps.LatLngBounds();
  this.paths.forEach(function(path) {
    if (!Array.isArray(path)) {
      path = [path];
    }
    path.forEach(bounds.extend.bind(bounds));
  });
  this.bounds = bounds;
  this.updateHitbox();
};

/**
 * Create hitbox from country bounds.
 */
app.Country.prototype.updateHitbox = function() {
  var ne = app.utils.latLngToPoint(this.map, this.bounds.getNorthEast());
  var sw = app.utils.latLngToPoint(this.map, this.bounds.getSouthWest());

  var hitboxSize = app.Constants.HITBOX_SIZE;
  ne.x += hitboxSize;
  ne.y -= hitboxSize;
  sw.x -= hitboxSize;
  sw.y += hitboxSize;

  var hitbox = new google.maps.LatLngBounds();
  hitbox.extend(app.utils.pointToLatLng(this.map, ne));
  hitbox.extend(app.utils.pointToLatLng(this.map, sw));
  this.hitbox = hitbox;
};

/**
 * Draw the bounds of the country. Used for debugging.
 */
app.Country.prototype.showBounds = function() {
  this.debugBounds && this.debugBounds.setMap(null);
  this.debugBounds = new google.maps.Rectangle({
    map: this.map,
    bounds: this.hitbox,
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
  if (this.isMatching()) {
    this.polygon.setOptions({
      draggable: false,
      fillOpacity: 0.75,
      zIndex: 2
    });
    this.polygon.setPaths(this.correctPaths);

    this.matched = true;
    this.onMatched && this.onMatched(this);
    window.santaApp.fire('sound-trigger', 'mercator_success');
  } else {
    window.santaApp.fire('sound-trigger', 'mercator_place');
  }
};

/**
 * Check if the country is in the correct position.
 * @return {boolean} Is the country matching?
 */
app.Country.prototype.isMatching = function() {
  var paths = this.polygon.getPaths().getArray();

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i].getArray();
    for (var j = 0; j < path.length; j++) {
      if (!this.hitbox.contains(path[j])) {
        return false;
      }
    }
  }

  return true;
};
