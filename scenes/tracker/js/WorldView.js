
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

  this.SantaLayer_ = null;

  this.init_ = false;

  this.lockOnSanta_ = true;
}

/**
 * @type {boolean}
 * @private
 */
WorldView.HDPI_ = !!(window.devicePixelRatio &&
    window.devicePixelRatio > 1.5);

WorldView.prototype.show = function() {
  this.showSceneMarkers_();
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

  this.SantaLayer_ = new SantaLayer(this.base_, {
    map: this.map_
  });

  this.SantaLayer_.addListener('santa_clicked', this.onSantaLayerClick_.bind(this));

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
  if (!this.SantaLayer_) return;
  var loc = mapsLatLng(state.position);
  this.SantaLayer_.setPosition(loc);
  this.SantaLayer_.set('type', state.stopover ? 'presents' : 'sleigh');
  this.SantaLayer_.setHeading(state.heading);
  this.SantaLayer_.updateTrail(state);

  if (this.lockOnSanta_) {
    var bounds = this.SantaLayer_.getBounds();
    this.map_.fitBounds(bounds);
  }
};

WorldView.prototype.createSceneMarkers_ = function() {
  this.sceneMarkers_ = [];
  for (var i = 0, scene; scene = this.SCENES_[i]; i++) {
    var marker = new google.maps.Marker({
      position: scene.pos,
      icon: this.SCENE_ICON_,
      'st_time': scene.time,
      visible: false,
      map: this.map_
    });

    marker.addListener('click', this.onSceneMarkerClick_.bind(scene.id));
    this.sceneMarkers_.push(marker);
  }
};

WorldView.prototype.showSceneMarkers_ = function() {
  var now = this.base_.santaApp.santaService.now();
  for (var i = 0, marker; marker = this.sceneMarkers_[i]; i++) {
    var time = marker.get('st_time');
    marker.setVisible(now > time);
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
    time: 1356348000000
  },
  {
    id: 'undersea',
    pos: {lat: 23.885838, lng: -39.388183},
    time: 1356410280000
  },
  {
    id: 'island',
    pos: {lat: -16.045813, lng: 84.889161},
    time: 1356375420000
  },
  {
    id: 'icecave',
    pos: {lat: -71.965388, lng: 3.678223},
    time: 1356406200000
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