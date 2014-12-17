/**
 * @fileoverview
 * Shared JavaScript client for ST2012 API.
 */

/**
 * Creates a new Santa service object.
 *
 * @param {string} clientId
 * @param {string} lang
 * @constructor
 */
function SantaService(clientId, lang) {
  this.lang_ = lang;

  /**
   * @private {!Array.<!SantaLocation>}
   */
  this.destinations_ = [];

  /**
   * @private {!Array.<!StreamCard>}
   */
  this.stream_ = [];

  var that = this;
  this.boundFetchDetails_ = function(id, callback) {
    that.fetchDetails_(id, callback);
  };

  /**
   * A number between 0 and 1, consistent within a user session. Sent to the
   * server to determine a consistent time offset for this client.
   *
   * @private {number}
   */
  this.jitterRand_ = Math.random();

  /**
   * @private {string}
   */
  this.clientId_ = clientId;

  /**
   * @private {number}
   */
  this.offset_ = 0;

  /**
   * @private {string}
   */
  this.fingerprint_ = '';

  /**
   * @private {boolean}
   */
  this.killed_ = false;

  /**
   * True if there is already a pending sync.
   * @private {boolean}
   */
  this.syncInFlight_ = false;

  /**
   * True if a sync has occurred at any point.
   * @private {boolean}
   */
  this.synced_ = false;

  /**
   * An extra offset determined by a URL parameter ("timestamp_override")
   *
   * @private {number|undefined}
   */
  this.debugOffset_;

  if (window['DEV']) {
    var overrideParam = this.getUrlParameter_('timestamp_override');
    if (overrideParam) {
      if (overrideParam[overrideParam.length - 1] == '/') {
        overrideParam = overrideParam.slice(0, -1);
      }
      this.debugOffset_ = overrideParam - new Date();
    }
  }
}

/**
 * @param {string} eventName
 * @param {!Function} handler
 * @return {!SantaEventListener}
 */
SantaService.prototype.addListener = function(eventName, handler) {
  return Events.addListener(this, eventName, handler);
};

/**
 * @const
 * @private
 */
SantaService.prototype.CALLBACK_FUNC_ = 'santa_api_callback';

/**
 * @const
 * @private
 */
SantaService.prototype.DETAILS_CALLBACK_FUNC_ = 'santa_api_details_callback';

/**
 * @param {function(SantaState)} callback
 */
SantaService.prototype.getCurrentLocation = function(callback) {
  var that = this;

  var now = this.now();
  var dest = this.findDestination_(now);
  if (!this.isSynced()) {
    this.sync(function() {
      that.getCurrentLocation(callback);
    });
    return;
  }

  // TODO: handle dest == null
  if (dest == null) {
    return;
  }

  var next = dest.next();

  if (now < dest.departure) {
    // At location
    var state = /** @type {SantaState} */({
      position: dest.getLocation(),
      presentsDelivered: this.calculatePresentsDelivered_(now, dest.prev(),
                                                          dest, next),
      distanceTravelled: dest.getDistanceTravelled(),
      heading: 0,
      prev: dest.prev(),
      stopover: dest,
      next: next
    });
    callback(state);
    return;
  }

  // In transit
  var travelTime = next.arrival - dest.departure;
  var elapsed = Math.max(now - dest.departure, 0);

  // TODO: handle post-xmas case.
  var currentLocation = Spherical.interpolate(
      dest.getLocation(),
      next.getLocation(),
      elapsed / travelTime);

  var state = /** @type {SantaState} */({
    position: currentLocation,
    heading: Spherical.computeHeading(currentLocation, next.getLocation()),
    presentsDelivered: this.calculatePresentsDelivered_(now, dest, null, next),
    distanceTravelled: this.calculateDistanceTravelled_(now, dest, next),
    prev: dest,
    stopover: null,
    next: next
  });
  callback(state);
};

/**
 * @const
 * @private
 */
SantaService.prototype.PRESENTS_OVER_WATER_ = .3;

/**
 * @const
 */
SantaService.prototype.PRESENTS_IN_CITY =
    1 - SantaService.prototype.PRESENTS_OVER_WATER_;

/**
 * @param {number} now
 * @param {SantaLocation} prev
 * @param {SantaLocation} stopover
 * @param {SantaLocation} next
 * @return {number}
 */
SantaService.prototype.calculatePresentsDelivered_ = function(now, prev, stopover, next) {
  if (!stopover) {
    var elapsed = now - prev.departure;
    var duration = next.arrival - prev.departure;
    var delivering = next.presentsDelivered - prev.presentsDelivered;
    delivering *= this.PRESENTS_OVER_WATER_;

    // While flying, deliver some of the quota.
    return Math.floor(prev.presentsDelivered + delivering * elapsed / duration);
  }

  var elapsed = now - stopover.arrival;
  var duration = (stopover.departure - stopover.arrival) || 1e-10;
  var delivering = stopover.presentsDelivered - prev.presentsDelivered;

  // While stopped, deliver remaining quota.
  return Math.floor(prev.presentsDelivered +
                    (delivering * this.PRESENTS_OVER_WATER_) +
                    delivering * this.PRESENTS_IN_CITY * elapsed / duration);
};

/**
 * @param {number} now
 * @param {SantaLocation} prev
 * @param {SantaLocation} next
 * @return {number}
 */
SantaService.prototype.calculateDistanceTravelled_ = function(now, prev, next) {
  var elapsed = now - prev.departure;
  var travelTime = next.arrival - prev.departure;
  if (!travelTime) {
    return next.getDistanceTravelled();
  }

  var legLength = next.getDistanceTravelled() - prev.getDistanceTravelled();

  return prev.getDistanceTravelled() + (legLength * (elapsed / travelTime));
};

/**
 * @return {!Array.<!SantaLocation>|null} a list of destinations, or null if the
 * service isn't ready.
 */
SantaService.prototype.getDestinations = function() {
  return this.destinations_.length ? this.destinations_ : null;
};

/**
 * @return {!Array.<!StreamCard>|null} a list of cards, or null if the
 * service isn't ready.
 */
SantaService.prototype.getStream = function() {
  return this.stream_.length ? this.stream_ : null;
};

/**
 * Finds Santa's current SantaLocation, or the one he was most recently at.
 *
 * @param {number} timestamp
 * @return {SantaLocation} null if the next destination cannot be found.
 * @private
 */
SantaService.prototype.findDestination_ = function(timestamp) {
  if (!this.destinations_.length) {
    return null;
  }
  if (this.destinations_[0].departure > timestamp) {
    // It's not xmas eve yet, so just assume Santa is at his workshop.
    return this.destinations_[0];
  }

  var i, dest;
  for (i = 0; dest = this.destinations_[i]; i++) {
    if (timestamp < dest.arrival) {
      break;
    }
  }
  return this.destinations_[i - 1];
};

/**
 * Appends newly fetched destinations to the current destination list.
 * @param {number} index the index that newDestinations should be spliced into
 * the destinations list.
 * @param {!Array.<!SantaLocation>} newDestinations
 * @private
 */
SantaService.prototype.appendDestinations_ = function(index, newDestinations) {
  if (!newDestinations || !newDestinations.length) {
    // Nothing to append.
    return;
  }
  // The server may return a value different to the current length of the
  // destinations (i.e. what we gave it). Always consider the server to be
  // correct. For example, if the server thinks we should replace the whole
  // route, index will be 0 and the destinations list will be truncated.
  //
  // NOTE(cbro): Existing locations hold a reference to the array, so ensure
  // that the array referenced by this.destinations_ is never changed.
  this.destinations_.splice(index, this.destinations_.length - index);
  for (var i = 0; i < newDestinations.length; i++) {
    this.destinations_.push(newDestinations[i]);
  }

  // decorate the server responses with the SantaLocation type.
  for (var i = index, destination; destination = this.destinations_[i]; i++) {
    this.destinations_[i] = new SantaLocation(destination,
                                              this.boundFetchDetails_,
                                              this.destinations_,
                                              i);
  }

  Events.trigger(this, 'destinations_changed', this.destinations_);
};

/**
 * Appends newly fetched cards to the current card stream.
 * @param {number} index the index that newCards should be spliced into the
 * stream list.
 * @param {!Array.<!StreamCard>} newCards
 * @private
 */
SantaService.prototype.appendStream_ = function(index, newCards) {
  if (!newCards || !newCards.length) {
    // Nothing to append.
    return;
  }
  // The server may return a value different to the current length of the
  // destinations (i.e. what we gave it). Always consider the server to be
  // correct. For example, if the server thinks we should replace the whole
  // route, index will be 0 and the destinations list will be truncated.
  this.stream_.splice(index, this.stream_.length - index);
  for (var i = 0; i < newCards.length; i++) {
    this.stream_.push(newCards[i]);
  }
  Events.trigger(this, 'stream_changed', this.stream_);
};

/**
 * @param {string} id
 * @param {function(SantaDetails)} callback
 */
SantaService.prototype.fetchDetails_ = function(id, callback) {
  var that = this;

  crossDomainAjax({
    cache: true,
    jsonpCallback: this.DETAILS_CALLBACK_FUNC_,
    url: 'details',
    data: {
      'id': id,
      'language': this.lang_,
      'fingerprint': this.fingerprint_
    },
    done: function(result) {
      if (result['status'] != 'OK') {
        window.console.error(result, result['status']);
        return;
      }
      callback(/** @type {SantaDetails} */(result['details']));
    },
    fail: function() {
      // Don't show any details.
    }
  });
};

/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 * @private
 */
SantaService.prototype.getUrlParameter_ = function(param) {
  if (!window.location.search) return;
  var m = new RegExp(param + '=([^&]*)').exec(
      window.location.search.substring(1));
  if (!m) return;
  return decodeURIComponent(m[1]);
};

/**
 * Synchronize info with the server. This function returns immediately, the
 * synchronization is performed asynchronously.
 *
 * @param {Function} opt_callback
 */
SantaService.prototype.sync = function(opt_callback) {
  if (this.syncInFlight_ && opt_callback) {
    this.addListener('sync', opt_callback);
    return;
  }
  this.syncInFlight_ = true;

  var that = this;

  crossDomainAjax({
    url: 'info',
    data: {
      'rand': this.jitterRand_,
      'client': this.clientId_,
      'language': this.lang_,
      // If this fingerprint doesn't match the servers, the server will replace
      // the route and status message text.
      'fingerprint': this.fingerprint_,
      'routeOffset': this.destinations_.length,
      'streamOffset': this.stream_.length
    },
    done: function(result) {
      if (result['status'] != 'OK') {
        window.console.error(result['status']);
        that.kill_();
      }

      that.offset_ = result['now'] + result['timeOffset'] - new Date();
      if (result['switchOff']) {
        that.kill_();
      } else {
        that.resuscitate_();
      }

      that.fingerprint_ = result['fingerprint'];
      that.clientSpecific_ = result['clientSpecific'];
      that.appendDestinations_(result['routeOffset'], result['destinations']);
      that.appendStream_(result['streamOffset'], result['stream']);

      that.synced_ = true;
      that.syncInFlight_ = false;
      Events.trigger(that, 'sync');

      window.setTimeout(function() {
        that.sync();
      }, result['refresh']);

      if (opt_callback) {
        opt_callback();
      }
    },
    fail: function() {
      // TODO: perhaps trigger something other than kill, if a recovery can be
      // made.
      that.kill_();
    }
  });
};

/**
 * Send the kill event.
 * @private
 */
SantaService.prototype.kill_ = function() {
  if (this.killed_) {
    return;
  }
  this.killed_ = true;
  Events.trigger(this, 'kill');
};

/**
 * Send the andwereback event.
 * @private
 */
SantaService.prototype.resuscitate_ = function() {
  if (!this.killed_) {
    return;
  }
  this.killed_ = false;
  Events.trigger(this, 'andwereback');
};

/**
 * @return {number}
 */
SantaService.prototype.now = function() {
  return +new Date() + (this.debugOffset_ || this.offset_);
};

/**
 * @return {!Date}
 */
SantaService.prototype.dateNow = function() {
  return new Date(this.now());
};

/**
 * @return {boolean} true if time has been synchronized with the server.
 */
SantaService.prototype.isSynced = function() {
  return this.synced_;
};

/**
 * @return {boolean} true if the service has been killed.
 */
SantaService.prototype.isKilled = function() {
  return this.killed_;
};

/**
 * Client-specific kill switches.
 * For example, the website has a flag to disable the Google earth button.
 * @return {!Object}
 */
SantaService.prototype.getClientSpecific = function() {
  return this.clientSpecific_ || {};
};

window['SantaService'] = SantaService;
