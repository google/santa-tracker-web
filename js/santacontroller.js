/**
 * @param {string} lang
 * @param {!ModuleLoader} moduleLoader
 * @param {!Analytics} analytics
 * @constructor
 */
function SantaController(lang, moduleLoader, analytics) {
  this.lang_ = lang;

  this.analytics = analytics;

  var apiClient = getUrlParameter('api_client') || 'web';
  var santaService = this.santaService_ = new SantaService(apiClient, lang);
  santaService.addListener('kill', function() {
    window.location = 'error.html';
  });

  // this.moduleLoader_ = moduleLoader;

  // this.sitenav_ = new SiteNav();

  //TODO(lukem): Tracker moves to scene

  /*
  TODO(lukem): Add back in preload manager
  this.preloader_ = new PreloadManager;
  this.preloader_.setOnPreload(_.bind(this.preload_, this));
  this.preloader_.setLoadingGraphics('#47c6ee',
      STATIC_DIR + '/images/village_loading.gif');
  this.preloader_.setShouldFake(false);
  this.preloader_.setOnShow(_.bind(this.onLoad_, this));

  var that = this;

  this.trackerController_ = new TrackerController(santaService);
  Events.addListener(this.trackerController_, 'flight_over',
                     function() {
                       that.postFlight_();
                       window.location.hash = '/village';
                     });
  this.moduleController_ = new ModuleController(this.moduleLoader_);
  this.villageController_ = new VillageController(santaService);
  Events.addListener(this.villageController_, 'countdown_finished',
                     _.bind(this.postCountdown_, this));

  var crossroads = window.crossroads;
  crossroads.routed.add(function(url) {
    that.analytics.trackPageView(url);
    // Lean-back mode will be cycling through various screens.
    // For embeds, deep link the user to the exact screen they're looking at.
    $('#click-capture').attr('href', 'https://www.google.com/santatracker/' +
                             window.location.hash);
  });
  // If no route is found, redirect the user to the default route
  crossroads.bypassed.add(function() {
    window.console.log('route.bypassed');
    window.location.hash = '';
    if (santaService.now() < Countdown.END_DATE ||
       santaService.now() > Countdown.FLIGHT_FINISHED) {
      window.location.replace('#/village');
    } else {
      window.location.replace('#/tracker/dashboard');
    }
  });

  window.onhashchange = function() {
    that.sitenav_.close();
    var path = window.location.hash.substring(1);
    // crossroads.parse('') is a no-op, so just dispatch the "bypassed"
    // manually.
    if (!path) {
      crossroads.bypassed.dispatch();
    } else {
      crossroads.parse(path);
    }
  };

  // Calls SantaController.preload.
  this.preloader_.show($('#page-progress').show()[0]);*/

  this.onLoad_();
}

/**
 * @param {ProgressGroup} progress
 * @private
 */
SantaController.prototype.preload_ = function(progress) {
  var sync = progress.create();
  this.santaService_.sync(_.bind(sync.resolve, sync));
};

/**
 * Called when everything has loaded and is ready to go.
 * @private
 */
SantaController.prototype.onLoad_ = function() {
  var santaService = this.santaService_;
  if (santaService.now() > window.santatracker.COUNTDOWN_END_DATE) {
    if (santaService.now() < window.santatracker.FLIGHT_FINISHED) {
      this.postCountdown_();
    } else {
      this.postFlight_();
    }
  }

  //this.villageController_.setupRoutes();
  //this.moduleController_.setupRoutes();
  //window.onhashchange();
};

/**
 * When the flight finishes, redirect the user to the village.
 * @private
 */
SantaController.prototype.postFlight_ = function() {
  if ($(document.body).hasClass('postflight')) return;

  //this.trackerController_.tearDownRoutes();
  $(document.body).addClass('postflight').removeClass('posttakeoff');
  window.console.log('postflight');
  var lockHouse = function(houseId) {
    $('#' + houseId).addClass('iced').removeClass('melt')
      .attr('disabled', 'disabled')
      .find('.house-marker').hide();

    $('#calendar-' + houseId).addClass('iced').removeClass('melt');
  };
  lockHouse('house12'); // callfromsanta
  lockHouse('house19'); // briefing
  lockHouse('house27'); // tracker
};

/**
 * When the countdown finishes, redirect the user to the tracker.
 * @private
 */
SantaController.prototype.postCountdown_ = function() {
  if (this.santaService_.now() > Countdown.FLIGHT_FINISHED) {
    this.postFlight_();
    return;
  }
  if ($(document.body).hasClass('posttakeoff')) return;

  this.trackerController_.setupRoutes();
  $(document.body).addClass('posttakeoff');
};

SantaController.prototype.getService = function() {
  return this.santaService_;
};
