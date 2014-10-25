/**
 * @param {SantaService} santaService
 * @constructor
 */
function VillageController(santaService) {
  this.santaService_ = santaService;

  var container = $('#page-village');
  this.view_ = new VillageView(santaService, container);
  VillageUtils.forwardEvent(this.view_, 'countdown_finished', this);

  /**
   * The current day in the caledar schedule
   * @type {number}
   * @private
   */
  this.scheduleDay_ = 1;

  this.checkSchedule_(true);

  this.preloader_ = new PreloadManager;
  this.preloader_.setOnHide(_.bind(this.view_.hide, this.view_));
  this.preloader_.setOnShow(_.bind(this.view_.show, this.view_));
  this.preloader_.setOnPreload(_.bind(this.view_.preload, this.view_));
  this.preloader_.setLoadingGraphics('#47c6ee',
      STATIC_DIR + '/images/village_loading.gif');
}

/**
 * The schedule of houses that open based on the day. Day - 1 is the index.
 * @private
 */
VillageController.SCHEDULE_ = [
  'house1', // airport
  'house2', // racer
  'house3', // trailer
  'house4', // windtunnel
  'house5', // boatload
  'house7', // streets
  'house8', // factory
  'house9', // rollercoaster
  'house11', // commandcentre
  'house12', // callfromsanta
  'house13', // gumballs
  'house14', // sendamessage
  'house15', // mountain
  'house16', // playground
  'house18', // ferriswheel
  'house19', // briefing
  'house20', // matching
  'house21', // choir
  'house22', // jetpack
  'house23', // presentdrop
  'house24', // traditions
  'house25', // workshop
  'house26', // finalprep
  'house27' // tracker
];

VillageController.prototype.setupRoutes = function() {
  var crossroads = window.crossroads;
  var route;
  route = crossroads.addRoute('village', null, 10);
  route.greedy = true;
  route.matched.add(_.bind(this.showVillage_, this));
  route.switched.add(_.bind(this.hideVillage_, this));

  // NOTE: routes for houses are set up in web/js/ModuleController.js
};

/**
 * Shows the village and starts the schedule checker
 * @private
 */
VillageController.prototype.showVillage_ = function() {
  this.preloader_.show($('#page-progress').show()[0]);
  window.clearTimeout(this.scheduleTimeout_);
  this.checkSchedule_();
};

/**
 * Unlocks the correct houses based on the day (index).
 * @param {boolean=} opt_once check only once.
 * @private
 */
VillageController.prototype.checkSchedule_ = function(opt_once) {
  var date = new Date(this.santaService_.now());
  // TODO: Remove this hack before the 2014 release.
  // Hard coding the date to the 30th so houses don't refreeze in January.
  var day = 31;
  // var day = date.getDate();

  // Houses unlock at 6am
  if (date.getHours() < 6) day--;

  // We don't want users still in November seeing all the Houses unlocked.
  // The site will be shut down before November the following year.
  if (day >= this.scheduleDay_ && date.getMonth() != 10) {
    for (var i = this.scheduleDay_; i <= day; i++) {
      var houseId = VillageController.SCHEDULE_[i - 1];
      if (!houseId) {
        // Nothing more to unlock.
        break;
      }
      if (houseId.indexOf('disable') !== 0 &&
          !$('#' + houseId).attr('disabled')) {
        this.view_.unlockHouse(houseId);
      }
    }

    this.scheduleDay_ = day;
  }

  if (opt_once) {
    return;
  }

  // Check again at the next hour tick
  var timeTillHour = (60 - date.getMinutes()) * 60 * 1000;
  this.scheduleTimeout_ = window.setTimeout(_.bind(this.checkSchedule_, this),
      timeTillHour);
};

/**
 * Hides the village and stops the schedule checker
 * @private
 */
VillageController.prototype.hideVillage_ = function() {
  window.clearTimeout(this.scheduleTimeout_);
  this.preloader_.hide();
};
