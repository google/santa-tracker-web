/**
 * Renders Snow on Santa's village
 *
 * @constructor
 */
function VillageSnow() {
  /**
   * @type {boolean}
   * @private
   */
  this.snowing_ = false;

  /**
   * @type {number}
   * @private
   */
  this.freeFlakeIndex_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.maxNumFlakes_ = 0;

  /**
   * Unfortunate hack to work around the fact that Firefox can't transition and
   * animate an element without glitching. Because snow needs to animate over
   * the height of the window and that's very difficult to specify in keyframes
   * without using 100%-high divs (which then kill paint performance on
   * mobile), we're just going to disable the animation on Firefox while
   * leaving the vertical transition.
   * TODO: remove if used in 2014 and Firefox now renders correctly.
   * @private {boolean}
   */
  this.animate_ = !navigator.userAgent.match(/firefox/i);

  /**
   * @type {jQuery}
   * @private
   */
  this.snowFlakeTemplate_ = $('<div><div class="snow-flake-inner"/></div>').
      addClass('snow-flake');

  if (this.animate_) {
    this.snowFlakeTemplate_.addClass('snow-flake-animated');
  }

  /**
   * Pool of snowflakes ready to fall.
   * @private {!Array.<SnowFlake>}
   */
  this.freeFlakeList_ = [];

  /**
   * Bound reclaim callback.
   * @private {function(SnowFlake)}
   */
  this.reclaimCallback_ = _.bind(this.reclaimSnowFlake_, this);

  this.calcAndAssignMaxNumFlakes_();

  $(window).resize(_.bind(this.calcAndAssignMaxNumFlakes_, this));
}

/**
 * @const
 * @type {Array.<Object, string>}
 * @private
 */
VillageSnow.SNOW_FLAKES_ = [{
    name: 'snow-flake-large',
    time: 15000
  }, {
    name: 'snow-flake-medium',
    time: 20000
  }, {
    name: 'snow-flake-small',
    time: 25000
  }
];

/**
 * @const
 * @private {number}
 */
VillageSnow.MAX_SNOW_FLAKES_ = 70;

/**
 * @const
 * @private {number}
 */
VillageSnow.SNOW_FLAKE_TIME_ = 700; // ms

/**
 * Start the weather system
 */
VillageSnow.prototype.start = function() {
  if (!this.snowing_) {
    this.snowing_ = true;
    if ($(document.body).hasClass('chromecast')) {
      return;
    }

    this.scheduleSnowFlake_();
  }
};

/**
 * Stop snowing and remove all snow
 */
VillageSnow.prototype.stop = function() {
  this.snowing_ = false;
};

/**
 * Set the number of snowflakes in the scene based on window width and create
 * the DOM elements for them. Number only increases if called again and the
 * window size has changed (never decreases).
 * @private
 */
VillageSnow.prototype.calcAndAssignMaxNumFlakes_ = function() {
  var windowWidth = $(window).width();
  var pixelsPerFlake = 50; // Why not?
  var maxFlakes = Math.min(Math.round(windowWidth / pixelsPerFlake),
      VillageSnow.MAX_SNOW_FLAKES_);

  if (maxFlakes > this.maxNumFlakes_) {
    var parent = $('#village-wrapper');

    // Create any new needed snowflakes and add them to snowflake pool.
    for (var i = 0; i < (maxFlakes - this.maxNumFlakes_); i++) {
      // Pick a random snowflake size
      var size = VillageSnow.SNOW_FLAKES_[Math.floor(Math.random() *
          VillageSnow.SNOW_FLAKES_.length)];

      // Cloning a snow flake? I'm sure it's still unique inside.
      var snow = this.snowFlakeTemplate_.clone().addClass(size.name);
      parent.append(snow);

      var flake = new SnowFlake(snow, size.time);

      this.freeFlakeList_[this.freeFlakeIndex_] = flake;
      this.freeFlakeIndex_++;
    }

    this.maxNumFlakes_ = maxFlakes;
  }
};

/**
 * Adds snowflakes until there's enough snowflakes on the screen.
 * @private
 */
VillageSnow.prototype.addSnowFlake_ = function() {
  this.snowTimeout_ = null;

  if (!this.snowing_) {
    return;
  }

  if (this.freeFlakeIndex_ > 0) {
    var flake = this.freeFlakeList_[this.freeFlakeIndex_ - 1];
    this.freeFlakeList_[this.freeFlakeIndex_ - 1] = null;
    this.freeFlakeIndex_--;

    var randLeft = Math.random() * windowWidth();
    flake.startAnimation(randLeft, this.reclaimCallback_);

    // Add more snow flakes if more free ones remain
    if (this.freeFlakeIndex_ > 0) {
      this.scheduleSnowFlake_();
    }
  }
};

/**
 * Callback on snowflake animation completion to add them back to the free
 * flake list.
 * @param {SnowFlake} flake
 * @private
 */
VillageSnow.prototype.reclaimSnowFlake_ = function(flake) {
  this.freeFlakeList_[this.freeFlakeIndex_] = flake;
  this.freeFlakeIndex_++;

  this.scheduleSnowFlake_();
};

/**
 * Schedule a new snowflake if one isn't already on its way.
 * @private
 */
VillageSnow.prototype.scheduleSnowFlake_ = function() {
  if (this.snowing_ && !this.snowTimeout_) {
    var timeout = Math.random() * VillageSnow.SNOW_FLAKE_TIME_;
    this.snowTimeout_ =
        window.setTimeout(_.bind(this.addSnowFlake_, this), timeout);
  }
};
