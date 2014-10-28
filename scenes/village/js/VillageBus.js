/**
 * @constructor
 */
function VillageBus() {
  this.bus_ = $('#bus');
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

  this.sendRandomBus_();
};

/**
 * Works over, stop the bus!
 */
VillageBus.prototype.stop = function() {
  window.clearTimeout(this.randomBusTimeoutID_);
  window.clearTimeout(this.leaveStopTimeoutID_);
  this.bus_.removeClass();
};

/**
 * Send the bus to a bus stop, if not currently in transit.
 * @param {number} stopNumber
 */
VillageBus.prototype.sendBusToStop = function(stopNumber) {
  var stop = $('#busstop' + stopNumber);
  var stopEmpty = stop.hasClass('stop-empty');

  if (this.busInTransit_) {
    // Queue up the stop for next time
    if (!_.contains(this.busStopQueue_, stopNumber)) {
      if (!stopEmpty) {
        stop.addClass('stop-waiting');
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

  this.bus_.addClass('to-stop' + stopNumber);
  this.busInTransit_ = true;

  if (stopEmpty) {
    this.bus_.addClass('bus-load').removeClass('bus-unload');
  } else {
    this.bus_.addClass('bus-unload').removeClass('bus-load');
  }

  // time for bus to arrive at stop
  var timeUntilLoad = VillageBus.ANIMATION_TIMES_.BUS_ARRIVAL_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_PAD_TIME;

  // after bus arrives at stop, toggle load state and switch to leave animation
  var leaveStopFn = function() {
    this.bus_.toggleClass('bus-unload bus-load' +
        ' to-stop' + stopNumber + ' leave-stop');
    this.busEmpty_ = !this.busEmpty_;

    // switch bus stop state
    window.setTimeout(function() {
      stop.toggleClass('stop-empty').removeClass('stop-waiting');
    }, VillageBus.ANIMATION_TIMES_.BUS_LOAD_TIME / 2);

    // time to load/unload bus, and drive off screen
    var timeUntilReset = VillageBus.ANIMATION_TIMES_.BUS_LOAD_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_DEPARTURE_TIME +
      VillageBus.ANIMATION_TIMES_.BUS_PAD_TIME;

    var arriveAtStopFn = function() {
      // reset the bus now that animation is complete
      this.bus_.removeClass('leave-stop');
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
      _.bind(this.sendRandomBus_, this), randomBusTime);
};
