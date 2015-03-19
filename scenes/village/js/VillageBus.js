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
function VillageBus(el) {
  this.container_ = el;
  this.bus_ = this.container_.querySelector('#bus');

  this.isPaused_ = true;
}

/**
 * @private
 * @type {Object.<string>}
 */
VillageBus.ANIMATION_TIMES_ = {
  // NOTE: these are from #bus.to-stop and .leave-stop
  BUS_ARRIVAL_TIME: 8000,
  BUS_LOAD_TIME: 3000,
  BUS_DEPARTURE_TIME: 10000,
  BUS_PAD_TIME: 500,
  RANDOM_BUS_MIN_TIME: 30000,
  RANDOM_BUS_MAX_TIME: 60000
};

/**
 * Start the village bus
 */
VillageBus.prototype.start = function() {
  /**
   * @type {boolean}
   * @private
   */
  this.busEmpty_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.busInTransit_ = false;

  /**
   * @type {Array.<number>}
   * @private
   */
  this.busStopQueue_ = [];

  this.isPaused_ = false;

  this.sendRandomBus_();
};

/**
 * Works over, stop the bus!
 */
VillageBus.prototype.resume = function() {
  this.isPaused_ = false;

  if (!this.busInTransit_) {
    this.scheduleRandomBus_();
  }
};

/**
 * Works over, stop the bus!
 */
VillageBus.prototype.pause = function() {
  this.isPaused_ = true;
  window.clearTimeout(this.randomBusTimeoutID_);
};

/**
 * Works over, stop the bus!
 */
VillageBus.prototype.stop = function() {
  window.clearTimeout(this.randomBusTimeoutID_);
  window.clearTimeout(this.leaveStopTimeoutID_);
  this.bus_.className = '';
};

/**
 * Send the bus to a bus stop, if not currently in transit.
 * @param {number} stopNumber
 */
VillageBus.prototype.sendBusToStop = function(stopNumber) {  
  var stop = this.container_.querySelector('#busstop' + stopNumber);

  var stopEmpty = stop.classList.contains('stop-empty');

  if (this.busInTransit_) {
    // Queue up the stop for next time
    if (!this.busStopQueue_.indexOf(stopNumber) != -1) {
      if (!stopEmpty) {
        stop.classList.add('stop-waiting');
      }
      this.busStopQueue_.push(stopNumber);
    }
    return;
  }

  // cancel any pending random buses, if any
  if (this.randomBusTimeoutID_ >= 0) {
    window.clearTimeout(this.randomBusTimeoutID_);
    this.randomBusTimeoutID_ = -1;
  }

  this.bus_.classList.add('to-stop' + stopNumber);
  this.busInTransit_ = true;

  if (stopEmpty) {
    this.bus_.classList.switch('bus-unload', 'bus-load');
  } else {
    this.bus_.classList.switch('bus-load', 'bus-unload');
  }

  // time for bus to arrive at stop
  var timeUntilLoad = VillageBus.ANIMATION_TIMES_.BUS_ARRIVAL_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_PAD_TIME;

  // after bus arrives at stop, toggle load state and switch to leave animation
  var leaveStopFn = function() {
    var classList = this.bus_.classList;
    classList.toggle('bus-unload');
    classList.toggle('bus-load');
    classList.toggle('to-stop' + stopNumber);
    classList.toggle('leave-stop');
    this.busEmpty_ = !this.busEmpty_;

    // switch bus stop state
    window.setTimeout(function() {
      stop.classList.toggle('stop-empty');
      stop.classList.remove('stop-waiting');
    }, VillageBus.ANIMATION_TIMES_.BUS_LOAD_TIME / 2);

    // time to load/unload bus, and drive off screen
    var timeUntilReset = VillageBus.ANIMATION_TIMES_.BUS_LOAD_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_DEPARTURE_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_PAD_TIME;

    var arriveAtStopFn = function() {
      // reset the bus now that animation is complete
      this.bus_.classList.remove('leave-stop');
      this.busInTransit_ = false;

      // If the user has queued up a stop for the bus then send it right away,
      // the transit system in the village is very good. No muni here.
      if (this.busStopQueue_.length) {
        // Call this in a timeout after reset otherwise the bus drives backwards
        var stopId = this.busStopQueue_.shift();
        window.setTimeout(this.sendBusToStop.bind(this, stopId), 1);
      } else {
        this.scheduleRandomBus_();
      }
    };

    window.setTimeout(arriveAtStopFn.bind(this), timeUntilReset);
  };

  this.leaveStopTimeoutID_ =
      window.setTimeout(leaveStopFn.bind(this), timeUntilLoad);
};

/**
 * Send a bus to a random stop.
 * @private
 */
VillageBus.prototype.sendRandomBus_ = function() {
  if (this.isPaused_) return;

  var stopNumber = Math.floor(Math.random() * 3) + 1;
  this.sendBusToStop(stopNumber);
};

/**
 * Schedule a random bus for the near future.
 * @private
 */
VillageBus.prototype.scheduleRandomBus_ = function() {
  var randomBusTime = VillageBus.ANIMATION_TIMES_.RANDOM_BUS_MIN_TIME +
      Math.random() * (VillageBus.ANIMATION_TIMES_.RANDOM_BUS_MAX_TIME -
      VillageBus.ANIMATION_TIMES_.RANDOM_BUS_MIN_TIME);
  this.randomBusTimeoutID_ = window.setTimeout(
      this.sendRandomBus_.bind(this), randomBusTime);
};
