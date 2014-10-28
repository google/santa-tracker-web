/**
 * @constructor
 */
function VillageSnowMobile() {}

/**
 * @private
 * @type {number}
 */
VillageSnowMobile.BURNOUT_ANIMATION_TIME_ = 25000;

/**
 * @private
 * @type {number}
 */
VillageSnowMobile.MIN_BURNOUT_TIME_ = 20000;

/**
 * @private
 * @type {number}
 */
VillageSnowMobile.MAX_BURNOUT_TIME_ = 60000;

/**
 * Start sending random snow mobiles for a ride
 */
VillageSnowMobile.prototype.start = function() {
  this.scheduleRandomSnowMobile_();
};

/**
 * Stop sending snow mobiles and clear any timeouts
 */
VillageSnowMobile.prototype.stop = function() {
  window.clearTimeout(this.randomSnowMobileTimeoutID_);
};

/**
 * Send a snow mobile for a drive
 * @param {number} snowMobileId
 */
VillageSnowMobile.prototype.driveSnowMobile = function(snowMobileId) {
  var snowMobile = $('#snowmobile' + snowMobileId);
  this.scheduleRandomSnowMobile_();

  // If the snow mobile isn't interactive then do nothing.
  if (!snowMobile.hasClass('interactive')) return;

  snowMobile.addClass('gogo-snowmobile').removeClass('interactive');
  window.setTimeout(function() {
    snowMobile.removeClass('gogo-snowmobile').addClass('interactive');
  }, VillageSnowMobile.BURNOUT_ANIMATION_TIME_);
};

/**
 * Send a random snowmobile for a drive
 * @private
 */
VillageSnowMobile.prototype.sendRandomSnowMobile_ = function() {
  var snowMobileId = Math.floor(Math.random() * 3) + 1;
  this.driveSnowMobile(snowMobileId);
};

/**
 * Schedule a random snow mobile for the near future
 * @private
 */
VillageSnowMobile.prototype.scheduleRandomSnowMobile_ = function() {
  window.clearTimeout(this.randomSnowMobileTimeoutID_);

  var randomSnowMobileTime = VillageSnowMobile.MIN_BURNOUT_TIME_ +
      Math.random() * VillageSnowMobile.MAX_BURNOUT_TIME_;
  this.randomSnowMobileTimeoutID_ = window.setTimeout(
      this.sendRandomSnowMobile_.bind(this), randomSnowMobileTime);
};
