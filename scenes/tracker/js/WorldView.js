
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
  this.circleView_ = null;

  this.throttledFilterMarkers_ = throttle(this.filterMarkers_, 1000);

  this.mode_ = 'track';
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
  var status = this.base_.$['module-tracker'].querySelector('#status-bar');
  $('li.show', status).removeClass('show');

  this.base_.async(this.cycleStatus_.bind(this));
};

WorldView.prototype.hide = function() {
  if (this.cycleTimeout_) {
    window.clearInterval(this.cycleTimeout_);
  }
};

WorldView.prototype.cycleStatus_ = function() {
  window.clearInterval(this.cycleTimeout_);

  var status = this.base_.$['module-tracker'].querySelector('#status-bar');

  var active= $('li.show', status);
  var next;
  if (!active.length) {
    next = $('li', status).first();
    next.addClass('show');
  } else {
    active.removeClass('show');
    next = active.nextAll('li').first();;
  }

  next.addClass('show');

  this.cycleTimeout_ = window.setInterval(this.cycleStatus_.bind(this),
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

  if (this.mode_ == 'feed') {
    this.animateCircleIn_();
  } else {
    this.animateCircleOut_();
  }
};

WorldView.prototype.animateCircleIn_ = function() {
  if (!this.circleView_) {
    this.circleView_ = new CircleView(this.base_.$['module-tracker'].querySelector('#trackermap'), 'rgba(141, 35, 169, 0.7)', 1, true);

    google.maps.event.addListener(this.circleView_, 'close', this.onSantaLayerClick_.bind(this));
  }
  this.circleView_.setCenter(this.centerOffset_);
  this.circleView_.show();
};

WorldView.prototype.animateCircleOut_ = function() {
  if (this.circleView_) {
    this.circleView_.hide();
  }
};

WorldView.prototype.setupMap = function() {
  this.map_ = new google.maps.Map(this.base_.$['module-tracker'].querySelector('#trackermap'), {
    center: {lat: 0, lng: 0},
    zoom: 1,
    disableDefaultUI: true,
    backgroundColor: '#f6efe2',
    // It's important that we have map styles -- this prevents a call to
    // staticmap.
    styles: mapstyles.styles
  });

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

/**
 * @private
 */
WorldView.prototype.onSantaLayerClick_ = function() {
  google.maps.event.trigger(this, 'santa_clicked');
};

WorldView.prototype.moveSanta = function(state) {
  if (!this.santaLayer_) return;
  var loc = mapsLatLng(state.position);
  this.santaLayer_.setPosition(loc);
  this.santaLayer_.set('type', state.stopover ? 'presents' : 'sleigh');
  this.santaLayer_.setHeading(state.heading);
  this.santaLayer_.updateTrail(state);

  if (this.lockOnSanta_) {
    var bounds = this.santaLayer_.getBounds();
    this.map_.fitBounds(bounds);
    if (this.centerOffset_) {
      this.map_.panTo(this.getLatLngOffset_(
            loc,
            this.centerOffset_.x,
            this.centerOffset_.y + this.santaLayer_.getHeight() / 2));
    } else {
      this.map_.panTo(loc);
    }
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
  var now = this.base_.santaApp.santaService.now();

  for (var i = 0, marker; marker = this.routeMarkers_[i]; i++) {
    var dest = /** @type {SantaLocation} */(marker.get('st_dest'));
    var visible = now > dest.departure;
    if (marker.getVisible() != visible) {
      marker.setVisible(visible);
    }
  }

  this.showSceneMarkers_();
};

WorldView.prototype.fitBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  if (this.routeMarkers_) {
    for (var i = 0, marker; marker = this.routeMarkers_[i]; i++) {
      bounds.extend(marker.getPosition());
    }
  }

  this.map_.fitBounds(bounds);
  google.maps.event.trigger(this.map_, 'resize');
};

/**
 * @param {google.maps.Marker} marker
 * @param {string} destId
 */
WorldView.prototype.onRouteMarkerClick_ = function(marker, destId) {
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
