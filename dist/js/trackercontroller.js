/**
 * Controls everything about the tracking mode of Santa Tracker (a large
 * component!)
 *
 * @param {!SantaService} santaService
 * @extends {google.maps.MVCObject}
 * @constructor
 */
function TrackerController(santaService) {
  this.santaService_ = santaService;

  santaService.addListener('sync', _.bind(this.checkKillSwitches_, this));

  this.visible_ = false;

  // Limit screen updates to every 250ms.
  this.track_ = _.debounce(_.bind(this.forceTrack_, this), 250);

  this.container_ = $('#page-tracker');

  this.mapContainer_ = /** @type {!Element} */
      (document.getElementById('map'));
  var viewer = this.viewer_ = new MapsViewer(this.mapContainer_);

  this.earthContainer_ = /** @type {!Node} */
      (document.getElementById('earth'));
  this.earthViewContainer_ = /** @type {!Node} */
      (document.getElementById('earth-view'));

  this.earthController_ = new EarthController(this.earthContainer_,
      this.earthViewContainer_, santaService, STATIC_DIR,
      _.bind(this.disableEarthView_, this));

  this.earthDisabled_ = true;
  this.enableEarthView_();

  this.worldView_ = new WorldView(viewer.getMap(), santaService);
  this.worldView_.addListener('routemarker_clicked',
                              _.bind(this.setHash_, this, 'location'));
  this.worldView_.addListener('scenemarker_clicked',
                              _.bind(this.setHash_, this, 'surprise'));

  var locationContainer = /** @type {!Element} */
      (document.getElementById('location'));
  this.locationView_ = new LocationView(locationContainer,
                                        viewer, santaService);

  var dashboardContainer = /** @type {!Element} */
      (document.getElementById('dashboard'));
  this.dashboardView_ = new DashboardView(dashboardContainer,
                                          santaService, viewer);

  var showWorld = _.bind(this.setHash_, this, 'world');
  this.dashboardView_.addListener('close', showWorld);
  this.locationView_.addListener('close', showWorld);

  this.computeCenter_(true);
  $(window).resize(_.bind(this.computeCenter_, this));

  this.dashboardView_.bindTo('centerOffset', this);
  this.locationView_.bindTo('centerOffset', this);
  viewer.bindTo('centerOffset', this);

  this.setupModeSwitch_();

  /**
   * @type Object.<SantaLocation>
   */
  this.destsById_ = {};
  this.setDestinations_(santaService.getDestinations());
  santaService.addListener('destinations_changed',
                           _.bind(this.destinationsChanged_, this));

  this.leanBack_ = new LeanBack(santaService, this.LEANBACK_);

  this.preloader_ = new PreloadManager;
  this.preloader_.setOnHide(_.bind(this.hideInternal_, this));
  this.preloader_.setOnShow(_.bind(this.showInternal_, this));
  this.preloader_.setOnPreload(_.bind(this.preload_, this));
  this.preloader_.setLoadingGraphics('#47c6ee',
      STATIC_DIR + '/images/village_loading.gif');

  /**
   * @private {!Array.<Route>}
   */
  this.routes_ = [];
}

TrackerController.prototype = new google.maps.MVCObject();

TrackerController.prototype.setupRoutes = function() {
  this.tearDownRoutes();

  var that = this;
  var crossroads = window.crossroads;
  
  var route;
  route = crossroads.addRoute(/^.tracker\/(dashboard|world|location)/,
                              null, 10);
  this.routes_.push(route);
  route.greedy = true;
  route.matched.add(_.bind(this.show, this));
  route.switched.add(_.bind(this.hide, this));
  route.matched.add(_.bind(this.viewerSwitch_.flip, this.viewerSwitch_, 'map'));
  route.matched.add(_.bind(this.modeSwitch_.flip, this.modeSwitch_));

  route = crossroads.addRoute('tracker/dashboard', null, 5);
  this.routes_.push(route);
  route.greedy = true;
  route.matched.add(_.bind(this.dashboardView_.show, this.dashboardView_));
  route.switched.add(_.bind(this.dashboardView_.hide, this.dashboardView_));

  route = crossroads.addRoute('tracker/world', null, 5);
  this.routes_.push(route);
  route.greedy = true;
  route.matched.add(_.bind(this.worldView_.show, this.worldView_));
  route.matched.add(_.bind(this.setNavStatsVisible_, this, true));
  route.matched.add(function() {
    that.santaService_.getCurrentLocation(function(state) {
      that.viewer_.getMap().panTo(mapsLatLng(state.position));
    });
  });
  route.switched.add(_.bind(this.worldView_.hide, this.worldView_));
  route.switched.add(_.bind(this.setNavStatsVisible_, this, false));

  route = crossroads.addRoute('tracker/earth', null, 5);
  this.routes_.push(route);
  route.greedy = true;
  route.matched.add(_.bind(this.show, this));
  route.switched.add(_.bind(this.hide, this));
  route.matched.add(
      _.bind(this.viewerSwitch_.flip, this.viewerSwitch_, 'earth'));
  route.matched.add(_.bind(this.earthController_.show, this.earthController_));
  route.switched.add(_.bind(this.earthController_.hide, this.earthController_));

  route = crossroads.addRoute('tracker/location/{id}', null, 1);
  this.routes_.push(route);
  route.greedy = true;
  route.matched.add(_.bind(this.setLocationId_, this));
  route.matched.add(_.bind(this.locationView_.show, this.locationView_));
  route.switched.add(_.bind(this.locationView_.hide, this.locationView_));
};

/**
 * Removes all tracker routes.
 */
TrackerController.prototype.tearDownRoutes = function() {
  for (var i = 0; i < this.routes_.length; i++) {
    window.crossroads.removeRoute(this.routes_[i]);
  }
  this.routes_ = [];
};

/**
 * @param {string} id
 */
TrackerController.prototype.setLocationId_ = function(id) {
  this.locationId_ = id;
  var loc = this.destsById_[id];
  window.console.log('setLoc', id, loc);
  if (loc) {
    this.locationView_.setLocation(loc);
  }
};

/**
 * In pixels, the x co-ordinate of center of the circle overlays.
 *
 * @type {number}
 * @private
 * @const
 */
TrackerController.prototype.CIRCLE_LEFT_ = 260;

/**
 * @private
 * @const {!Array.<!Command>}
 */
TrackerController.prototype.LEANBACK_ = [
  LeanBack.route('tracker/dashboard'),
  LeanBack.route('tracker/world'),
  LeanBack.dynamic(function(state) {
    if (getUrlParameter('embed_client')) {
      // Don't show location pages for embeds.
      return null;
    }
    if (!state.prev) {
      // Nothing to show.
      return null;
    }
    // Show the previous city.
    // NOTE: Location view will re-direct back to world view.
    return LeanBack.route('tracker/location/' + state.prev.id, 50000);
  })
];

/**
 * @param {boolean=} force
 */
TrackerController.prototype.computeCenter_ = function(force) {
  if (!force && !this.visible_) return;
  var top, left;
  var width = $(window).width();
  if (width < 765) {
    // mobile
    left = width / 2;
    top = 20 + CircleView.HOLE_RADIUS;
  } else {
    // desktop
    left = this.CIRCLE_LEFT_;
    top = $(window).height() / 2;
  }
  this.set('centerOffset', new google.maps.Point(left, top));
};

/**
 * @param {ProgressGroup} progress
 * @private
 */
TrackerController.prototype.preload_ = function(progress) {
  var loadMap = progress.create();
  var viewer = this.viewer_;
  this.santaService_.getCurrentLocation(function() {
    viewer.init();
    viewer.render();
    loadMap.resolve();
  });
};

/**
 * Show the tracker.
 */
TrackerController.prototype.show = function() {
  this.preloader_.show($('#page-progress').show()[0]);
};

/**
 * Hide the tracker.
 */
TrackerController.prototype.hide = function() {
  this.preloader_.hide();
};

/**
 * Hide the tracker (via the preloader).
 */
TrackerController.prototype.hideInternal_ = function() {
  if (!this.visible_) return;
  this.visible_ = false;
  this.container_.hide();
  if ($(document.body).hasClass('chromecast')) {
    this.leanBack_.stop();
  }
  window.console.log('tracker internal hide');
};

/**
 * Show the tracker (via the preloader).
 */
TrackerController.prototype.showInternal_ = function() {
  if (this.visible_) return;
  window.console.log('tracker show');
  this.visible_ = true;
  this.track_();
  this.container_.show();
  this.viewer_.resize();
  if ($(document.body).hasClass('chromecast')) {
    this.leanBack_.start();
  }
  $(window).resize();
};

/**
 * @private
 */
TrackerController.prototype.forceTrack_ = function() {
  if (!this.visible_) {
    return;
  }
  // After the flight is over, make sure the village is shown.
  if (this.santaService_.now() > Countdown.FLIGHT_FINISHED) {
    Events.trigger(this, 'flight_over');
    this.tearDownRoutes();
    this.hide();
    return;
  }
  this.santaService_.getCurrentLocation(_.bind(this.updateReceived_, this));
};

/**
 * @param {SantaState} state
 * @private
 */
TrackerController.prototype.updateReceived_ = function(state) {
  var loc = mapsLatLng(state.position);
  this.viewer_.moveSanta(loc);

  var marker = this.viewer_.getMarker();
  marker.set('type', state.stopover ? 'presents' : 'sleigh');
  marker.setHeading(state.heading);

  this.dashboardView_.update(state);
  this.worldView_.update(state);

  this.track_();
};

TrackerController.prototype.setupModeSwitch_ = function() {
  var switchContainer = /** @type {!Node} */
      (document.getElementById('tracker-switcher'));
  this.modeSwitch_ = new SwitcherView(switchContainer);

  var viewerSwitchContainer = /** @type {!Node} */
      (document.getElementById('viewer-switcher'));
  this.viewerSwitch_ = new SwitcherView(viewerSwitchContainer);
};

/**
 * @param {string} a
 * @param {string=} b
 * @param {string=} c
 */
TrackerController.prototype.setHash_ = function(a, b, c) {
  var parts = ['/tracker'];
  a && parts.push(a);
  a && b && parts.push(b); // location id
  a && b && c && parts.push(c); // TODO: location tab
  window.console.log('sethash', parts, parts.join('/'));
  window.location.hash = parts.join('/');
};

/**
 * @param {boolean} visible
 */
TrackerController.prototype.setNavStatsVisible_ = function(visible) {
  if (visible) {
    $('#world-nav .world-nav-stats').show();
  } else {
    $('#world-nav .world-nav-stats').hide();
  }
};

/**
 * Called when the SantaService gets an update of the itinerary.
 *
 * @private
 */
TrackerController.prototype.destinationsChanged_ = function() {
  var dests = this.santaService_.getDestinations();
  this.setDestinations_(dests);
};

TrackerController.prototype.setDestinations_ = function(dests) {
  window.console.log('setDestinations', dests);
  dests = dests || [];
  this.worldView_.setDestinations(dests);

  var destsById = {};
  for (var i = 0, loc; loc = dests[i]; i++) {
    destsById[loc.id] = loc;
  }
  this.destsById_ = destsById;

  if (this.locationId_) {
    this.locationView_.setLocation(destsById[this.locationId_]);
  }
};

/**
 * Enable the ability to switch to the Earth view.
 * @private
 */
TrackerController.prototype.enableEarthView_ = function() {
  if (!this.earthDisabled_) {
    return;
  }
  if (!this.earthController_.isSupported() ||
      !this.earthController_.isInstalled()) {
    this.earthDisabled_ = false;
    this.disableEarthView_();
    return;
  }
  $('#world-nav').removeClass('no-earth');
  this.earthDisabled_ = false;
};

/**
 * Remove the ability to switch to the Earth view.
 * @private
 */
TrackerController.prototype.disableEarthView_ = function() {
  if (this.earthDisabled_) {
    return;
  }
  if (this.earthController_.isVisible()) {
    window.location.hash = '/tracker/dashboard';
  }
  $('#world-nav').addClass('no-earth');
  this.earthDisabled_ = true;
};

/**
 * @private
 */
TrackerController.prototype.checkKillSwitches_ = function() {
  var opts = this.santaService_.getClientSpecific();
  // TODO: modify routes.
  if (opts['DisableEarth']) {
    this.disableEarthView_();
  } else {
    this.enableEarthView_();
  }
};
