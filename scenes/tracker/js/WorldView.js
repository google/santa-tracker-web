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


/* WorldView renders a map with Santa's locations.
 *
 * @constructor
 * @param {PolymerElement} base
 * @param {string} componentDir
 */
function WorldView(base, componentDir) {
  this.base_ = base;
  this.componentDir_ = componentDir;

  /**
   * @type {!Array.<!SantaLocation>}
   * @private
   */
  // TODO(samthor): This is disused after being set in setDestinations.
  this.destinations_ = [];

  /**
   * @type {!Array.<!google.maps.Marker>}
   */
  this.routeMarkers_ = [];

  /**
   * @type {!Array.<!google.maps.Marker>}
   */
  this.sceneMarkers_ = [];

  //this.createSceneMarkers_();
  this.map_ = null;

  this.santaLayer_ = null;

  this.lockOnSanta_ = true;

  this.throttledFilterMarkers_ = throttle(this.filterMarkers_, 1000);

  this.mode_ = 'track';
  this.statusBar_ = null;
}

/**
 * @type {boolean}
 * @private
 */
WorldView.HDPI_ = !!(window.devicePixelRatio &&
    window.devicePixelRatio > 1.5);

WorldView.CYCLE_TIME_ = 5000;

WorldView.prototype.show = function() {
  // Reset the cycle view incase show gets called more than once.
  this.statusBar_ = this.base_.$['module-tracker'].querySelector('#status-bar');
  $('li.show', this.statusBar_).removeClass('show');

  this.base_.async(this.cycleStatus_.bind(this));

  this.resizeHandler_ = this.onResize_.bind(this);
  this.resizeHandler_();
  window.addEventListener('resize', this.resizeHandler_);
};

WorldView.prototype.hide = function() {
  if (this.santaLayer_) {
    this.santaLayer_.hide();
  }

  window.removeEventListener('resize', this.resizeHandler_);
  this.resizeHandler_ = null;
};

WorldView.prototype.onResize_ = function() {
  var height = window.innerHeight - window.santaApp.headerSize;
  this.mapSize_ = new google.maps.Size(window.innerWidth, height);
};

WorldView.prototype.cycleStatus_ = function() {
  window.clearTimeout(this.cycleTimeout_);

  var active = $('li.show', this.statusBar_);
  active.removeClass('show');
  var next = active.nextAll('li').first();
  if (!next.length) {
    next = $('li', this.statusBar_).first();
  }

  next.addClass('show');

  this.cycleTimeout_ = window.setTimeout(this.cycleStatus_.bind(this),
      WorldView.CYCLE_TIME_);
};

WorldView.prototype.setMode = function(mode) {
  if (this.mode_ == mode) return;

  if (mode == 'feed') {
    this.mode_ = 'feed';
  } else {
    this.mode_ = 'track';
  }

  this.centerOffset_ = this.computeCenterOffset_();
};

WorldView.prototype.zoomIn = function() {
  this.startIdleTimeout_();
  if (!this.map_) return;

  this.map_.setZoom(this.map_.getZoom() + 1);
};

WorldView.prototype.zoomOut = function() {
  this.startIdleTimeout_();
  if (!this.map_) return;

  this.map_.setZoom(this.map_.getZoom() - 1);
};

WorldView.prototype.setupMap = function() {
  if (this.map_) return;
  this.map_ = new google.maps.Map(this.base_.$['module-tracker'].querySelector('#trackermap'), {
    center: {lat: 0, lng: 0},
    zoom: 1,
    minZoom: 1,
    'noPerTile': true,
    disableDefaultUI: true,
    backgroundColor: '#69d5d0',
    // It's important that we have map styles -- this prevents a call to
    // staticmap.
    styles: mapstyles.styles
  });

  var events = ['dragstart', 'dblclick', 'rightclick'];
  for (var i = 0; i < events.length; i++) {
    google.maps.event.addListener(this.map_, events[i], this.unfollowSanta.bind(this));
  }

  this.dummyOverlayView_ = createDummyOverlayView();
  this.dummyOverlayView_.setMap(this.map_);

  /**
  * @type {google.maps.Icon}
  */
  this.LOCATION_ICON_ = /** @type {google.maps.Icon} */({
    url: this.componentDir_ + (WorldView.HDPI_ ? 'img/marker-small_2x.png' :
      'img/marker-small.png'),
    size: new google.maps.Size(30, 16),
    scaledSize: new google.maps.Size(30, 16),
    anchor: new google.maps.Point(5, 16)
  });

  /**
  * @type {google.maps.Icon}
  */
  this.SCENE_ICON_ = /** @type {google.maps.Icon} */({
    url: this.componentDir_ + (WorldView.HDPI_ ? 'img/scenepin_2x.png' :
    'img/scenepin.png'),
    size: new google.maps.Size(30, 32),
    scaledSize: new google.maps.Size(30, 32),
    anchor: new google.maps.Point(15, 16)
  });

  this.createSceneMarkers_();

  var SantaLayer = createSantaLayerConstructor();

  this.santaLayer_ = new SantaLayer(this.base_, {
    map: this.map_
  });

  this.santaLayer_.addListener('santa_clicked', this.onSantaLayerClick_.bind(this));

  if (this.dests) {
    this.clearRouteMarkers_();
    this.setDestinations(this.dests);
  }
};

WorldView.prototype.IDLE_TIMEOUT_ = 60000;

/**
 * @private
 */
WorldView.prototype.onSantaLayerClick_ = function() {
  this.startIdleTimeout_();
  this.followSanta();
  google.maps.event.trigger(this, 'santa_clicked');
};

WorldView.prototype.followSanta = function() {
  this.base_.$['module-tracker'].querySelector('#tracker-zoom-controls').hidden = true;
  this.lockOnSanta_ = true;
};

WorldView.prototype.unfollowSanta = function() {
  this.base_.$['module-tracker'].querySelector('#tracker-zoom-controls').hidden = false;
  this.lockOnSanta_ = false;
  this.startIdleTimeout_();
};

WorldView.prototype.startIdleTimeout_ = function() {
  window.clearTimeout(this.idleTimeout_);

  this.idleTimeout_ = window.setTimeout(this.triggerIdle_.bind(this),
    this.IDLE_TIMEOUT_);
};

WorldView.prototype.triggerIdle_ = function() {
  google.maps.event.trigger(this, 'idle');
};

WorldView.prototype.moveSanta = function(state) {
  if (!this.santaLayer_) return;
  var loc = mapsLatLng(state.position);
  this.santaLayer_.setPosition(loc);
  this.santaLayer_.set('type', state.stopover ? 'presents' : 'sleigh');
  this.santaLayer_.setHeading(state.heading);
  this.santaLayer_.updateTrail(state);

  if (this.lockOnSanta_) {
    this.updateCamera_(state);
  }

  this.throttledFilterMarkers_();
};

WorldView.prototype.createSceneMarkers_ = function() {
  this.sceneMarkers_ = [];
  for (var i = 0, scene; scene = this.SCENES_[i]; i++) {
    var marker = new google.maps.Marker({
      position: scene.pos,
      icon: this.SCENE_ICON_,
      'st_launchDate': scene.launchDate,
      visible: false,
      map: this.map_
    });

    marker.addListener('click', this.onSceneMarkerClick_.bind(this, scene.id));
    this.sceneMarkers_.push(marker);
  }
};

WorldView.prototype.showSceneMarkers_ = function() {
  var now = this.base_.santaApp.santaService.now();
  for (var i = 0, marker; marker = this.sceneMarkers_[i]; i++) {
    var launchDate = marker.get('st_launchDate');
    var visible = now > launchDate;
    if (marker.getVisible() != visible) {
      marker.setVisible(visible);
    }
  }
};

/**
 * @param {string} scene
 * @private
 */
WorldView.prototype.onSceneMarkerClick_ = function(scene) {
  this.startIdleTimeout_();
  google.maps.event.trigger(this, 'scenemarker_clicked', scene);
};

/**
 * These are special scenes that are location on the map
 * @private
 */
WorldView.prototype.SCENES_ = [
  {
    id: 'blimp',
    pos: {lat: 37.160317, lng: 169.879395},
    launchDate: +new Date('Wed, 24 Dec 2014 11:20:00 GMT')
  },
  {
    id: 'undersea',
    pos: {lat: 23.885838, lng: -39.388183},
    launchDate: +new Date('Thu, 25 Dec 2014 04:38:00 GMT')
  },
  {
    id: 'island',
    pos: {lat: -16.045813, lng: 84.889161},
    launchDate: +new Date('Wed, 24 Dec 2014 18:57:00 GMT')
  },
  {
    id: 'icecave',
    pos: {lat: -71.965388, lng: 3.678223},
    launchDate: +new Date('Thu, 25 Dec 2014 03:30:00 GMT')
  },
];


/**
 * @param {!Array.<!SantaLocation>} dests
 */
WorldView.prototype.setDestinations = function(dests) {
  this.destinations_ = dests;
  this.clearRouteMarkers_();

  if (!dests || !dests.length) {
    return;
  }

  if (this.map_) {
    this.addMarkers_(dests);
  }
};

WorldView.prototype.addMarkers_ = function(dests) {
  for (var i = 0, dest; dest = dests[i]; i++) {
    var marker = new google.maps.Marker({
      'st_dest': dest,
      position: dest.location,
      icon: this.LOCATION_ICON_,
      visible: false,
      map: this.map_
    });
    marker.addListener('click', this.onRouteMarkerClick_.bind(this, marker, dest.id));

    this.routeMarkers_.push(marker);
  }

  this.filterMarkers_();
};

WorldView.prototype.filterMarkers_ = function() {
  var now = Infinity;
  if (this.base_.santaApp) {
    // might be called before/after santaApp is available
    now = this.base_.santaApp.santaService.now();
  }

  for (var i = 0, marker; marker = this.routeMarkers_[i]; i++) {
    var dest = /** @type {SantaLocation} */(marker.get('st_dest'));
    var visible = now > dest.departure;
    if (marker.getVisible() != visible) {
      marker.setVisible(visible);
    }
  }

  this.showSceneMarkers_();
};

/**
 * Updates the camera locked on Santa.
 * @param {SantaState}
 * @private
 */
WorldView.prototype.updateCamera_ = function(state) {
  // Work around https://b/18847104
  var bounds = this.santaLayer_.getBounds();
  bounds.extend(mapsLatLng(state.next.location));
  var windowSize = this.mapSize_;
  var proj = this.map_.getProjection();
  if (proj) {
    var zoom = this.getBoundsZoomLevel_(proj, bounds, windowSize);
    if (this.map_.getZoom() != zoom) {
      // Viewport request triggered if setZoom called (even if not changed).
      this.map_.setZoom(zoom);
    }
  }
  var center = mapsLatLng(state.position);
  if (this.centerOffset_) {
    center = this.getLatLngOffset_(
          center,
          this.centerOffset_.x,
          this.centerOffset_.y + this.santaLayer_.getHeight() / 2);
  }
  this.map_.panTo(center);
};

/**
 * From f:maps f:api util.js
 */
WorldView.prototype.getBoundsZoomLevel_ = function(projection, latLngBounds, viewSize) {
  var sw = latLngBounds.getSouthWest();
  var ne = latLngBounds.getNorthEast();
  var west = sw.lng();
  var east = ne.lng();
  // Wrap to ensure that west <= east.  This is necessary when the latLngBounds
  // crosses the longitudinal meridian.
  if (west > east) {
    sw = new google.maps.LatLng(sw.lat(), west - 360, true);
  }

  // Compute the bounds in projected coordinates (pixels at zoom 0).
  // corner1 and corner2 are opposite corners of the bounding rectangle,
  // though we do not which way is "up".
  var corner1 = projection.fromLatLngToPoint(sw);
  var corner2 = projection.fromLatLngToPoint(ne);
  var width = Math.max(corner1.x, corner2.x) - Math.min(corner1.x, corner2.x);
  var height = Math.max(corner1.y, corner2.y) - Math.min(corner1.y, corner2.y);

  // If the bounds is too large to display even at zoom level 0,
  // return zoom level 0 regardless.
  if (width > viewSize.width || height > viewSize.height) return 0;

  function log2(val) {
    return Math.log(val) / Math.LN2;
  }
  var eps = 1E-12;  // Avoid log of zero.
  var xZoom = log2(viewSize.width + eps) - log2(width + eps);
  var yZoom = log2(viewSize.height + eps) - log2(height + eps);
  var zoom = Math.floor(Math.min(xZoom, yZoom));
  return zoom;
};

/**
 * @param {google.maps.Marker} marker
 * @param {string} destId
 */
WorldView.prototype.onRouteMarkerClick_ = function(marker, destId) {
  this.startIdleTimeout_();
  this.followSanta();
  google.maps.event.trigger(this, 'routemarker_clicked', destId);
};


WorldView.prototype.clearRouteMarkers_ = function() {
  for (var i = 0, marker; marker = this.routeMarkers_[i]; i++) {
    marker.setMap(null);
    google.maps.event.clearInstanceListeners(marker);
  }
  this.routeMarkers_ = [];
};

WorldView.prototype.computeCenterOffset_ = function() {
  if (this.mode_ == 'track') {
    return null;
  }
  var top, left;
  var width = $(window).width();

  var holeRadius = width < 660 ? this.CIRCLE_HOLE_RADIUS_MOBILE : this.CIRCLE_HOLE_RADIUS;

  top = 130 + holeRadius;
  if (width <= 660) {
    // mobile
    left = width / 2;
    top = 20 + holeRadius;
  } else {
    // desktop
    left = this.CIRCLE_LEFT_;
  }
  return new google.maps.Point(left, top);
};

WorldView.prototype.CIRCLE_LEFT_ = 200;
WorldView.prototype.CIRCLE_HOLE_RADIUS = 74;
WorldView.prototype.CIRCLE_HOLE_RADIUS_MOBILE = 59;

/**
 * Calculates the LatLng that is a given offset in pixels away from a given
 * LatLng.
 *
 * @param {google.maps.LatLng} position
 * @param {number} x (from top of map container div)
 * @param {number} y (from left of map container div)
 * container div.
 * @return {google.maps.LatLng}
 */
WorldView.prototype.getLatLngOffset_ = function(position, x, y) {
  var proj = this.dummyOverlayView_.getProjection();
  if (!proj) {
    return position;
  }
  var centerPoint = proj.fromLatLngToContainerPixel(this.map_.getCenter());
  var positionPoint = proj.fromLatLngToContainerPixel(position);

  var dx = x - positionPoint.x;
  var dy = y - positionPoint.y;

  var target = new google.maps.Point(Math.round(centerPoint.x - dx),
                                     Math.round(centerPoint.y - dy));
  return proj.fromContainerPixelToLatLng(target)
};

/**
 * @return {!google.maps.OverlayView}
 */
function createDummyOverlayView() {
  var dov = new google.maps.OverlayView();
  dov.draw = dov.onRemove = dov.onAdd = function() {};
  return dov;
}
