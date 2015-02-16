/*global google*/
goog.provide('app.Country');

goog.require('app.utils');

/**
 * The country object.
 * @param {!google.maps.Map} map A Google map.
 * @param {object} feature The data for the country from GeoJSON.
 * @constructor
 */
app.Country = function(map, feature) {
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

  this.polygon = new google.maps.Polygon({
    map: null,
    paths: this.paths,
    strokeOpacity: 1,
    strokeWeight: 1,
    fillOpacity: 0.5,
    draggable: true,
    geodesic: false,
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
  var map = this.map;
  var center = app.utils.latLngToPoint(map, this.bounds.getCenter());
  var dX = point.x - center.x;
  var dY = point.y - center.y;

  var paths = [];
  this.paths.forEach(function(path) {
    var latLngs = [];
    path.forEach(function(latLng) {
      var pathPoint = app.utils.latLngToPoint(map, latLng);
      pathPoint.x += dX;
      pathPoint.y += dY;
      latLngs.push(app.utils.pointToLatLng(map, pathPoint));
    });
    paths.push(latLngs);
  });

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
