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

/**
 * @constructor
 */
function VillageSnowMobile(el) {
  this.container_ = el;
}

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
 * @param {!Element} snowMobile
 */
VillageSnowMobile.prototype.driveSnowMobile = function(snowMobile) {
  this.scheduleRandomSnowMobile_();

  // If the snow mobile isn't interactive then do nothing.
  if (!snowMobile.classList.contains('interactive')) {
    return;
  }

  snowMobile.classList.switch('interactive', 'gogo-snowmobile');
  window.setTimeout(function() {
    snowMobile.classList.switch('gogo-snowmobile', 'interactive');
  }, VillageSnowMobile.BURNOUT_ANIMATION_TIME_);
};

/**
 * Send a random snowmobile for a drive
 * @private
 */
VillageSnowMobile.prototype.sendRandomSnowMobile_ = function() {
  var snowMobileId = Math.floor(Math.random() * 3) + 1;
  this.driveSnowMobile(
      this.container_.querySelector('#snowmobile' + snowMobileId));
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
