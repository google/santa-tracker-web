/**
 * Renders Clouds on Santa's village
 *
 * @constructor
 */
function VillageClouds() {
  /**
   * @type {number}
   * @private
   */
  this.numClouds_ = 0;
}

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.ANIMATION_TIME_ = 120000;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MAX_NUM_OF_CLOUDS_ = 15;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MIN_CLOUD_ADD_TIME_ = 1000;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MAX_CLOUD_ADD_TIME_ = 30000;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MIN_CLOUD_TOP_ = 25;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MAX_CLOUD_TOP_ = 330;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MAX_CLOUD_WIDTH_ = 200;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.NUM_TYPES_OF_CLOUDS_ = 3;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MIN_NUMBER_OF_CLOUDS_ = 3;

/**
 * @private
 * @const
 * @type {number}
 */
VillageClouds.MAX_NUMBER_OF_CLOUDS_ = 7;

/**
 * Start adding clouds
 */
VillageClouds.prototype.start = function() {
  this.addClouds_();
};

/**
 * Stop adding and remove all clouds
 */
VillageClouds.prototype.stop = function() {
  window.clearTimeout(this.cloudTimeout_);
  this.numClouds_ = 0;
  $('#clouds').empty();
};

/**
 * Adds random clouds in the viewport. If transitions are supported it calls
 * to start adding random clouds.
 * @private
 */
VillageClouds.prototype.addClouds_ = function() {
  // Add some clouds at random points in the viewport so that they all don't
  // start off screen.
  var numClouds = Math.max(VillageClouds.MIN_NUMBER_OF_CLOUDS_,
      Math.ceil(Math.random() * VillageClouds.MAX_NUMBER_OF_CLOUDS_));
  var width = windowWidth();
  for (var i = 0; i < numClouds; i++) {
    this.addCloud_(Math.random() * width);
  }

  // If the browser supports animations the start adding clouds at random
  // intervals
  if (VillageUtils.TRANSITIONS_SUPPORTED) {
    this.addCloudAtRandomInterval_();
  }
};

/**
 * Repeatadly adds a cloud at a random intervals.
 * @private
 */
VillageClouds.prototype.addCloudAtRandomInterval_ = function() {
  if (this.numClouds_ < VillageClouds.MAX_NUM_OF_CLOUDS_) {
    this.addCloud_();
  }

  var timeout = Math.max(VillageClouds.MIN_CLOUD_ADD_TIME_,
      Math.random() * VillageClouds.MAX_CLOUD_ADD_TIME_);

  this.cloudTimeout_ =
      window.setTimeout(_.bind(this.addCloudAtRandomInterval_, this), timeout);
};

/**
 * Adds a cloud at a random height.
 * @param {?number} opt_offset Optional offset (left) to position the cloud.
 * @private
 */
VillageClouds.prototype.addCloud_ = function(opt_offset) {
  var top = Math.random() *
      (VillageClouds.MAX_CLOUD_TOP_ - VillageClouds.MIN_CLOUD_TOP_);
  var type = Math.ceil(Math.random() * VillageClouds.NUM_TYPES_OF_CLOUDS_);
  var width = windowWidth();
  var offset = opt_offset || width;
  var cloud = $('<div>').addClass('cloud cloud' + type).css({
    'top': top,
    'left': offset
  }).append('<div>');
  $('#clouds').append(cloud);
  this.numClouds_++;

  // If no transitions, keep static clouds where they are
  if (!VillageUtils.TRANSITIONS_SUPPORTED) {
    return;
  }

  cloud.addClass('cloud-fly');

  window.setTimeout(function() {
    cloud.css(VillageUtils.CSS_TRANSFORM,
        'translateX(-' + (width + VillageClouds.MAX_CLOUD_WIDTH_) + 'px)');
  }, 1);

  var that = this;
  window.setTimeout(function() {
    cloud.remove();
    that.numClouds_--;
  }, VillageClouds.ANIMATION_TIME_);
};
