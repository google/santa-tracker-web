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
   * All known destinations (including future ones).
   * Ordered chronologically (oldest destinations first).
   * @private {!Array.<!SantaLocation>}
   */
  this.destinations_ = [];

  /**
   * Stream of cards (e.g. didyouknow, etc) but not destinations.
   * Ordered chronologically (oldest cards first).
   * @private {!Array.<!StreamCard>}
   */
  this.stream_ = [];

  /**
   * Parts of the stream/destinations that have already elapsed (and should be
   * shown in the timeline view).
   * Ordered reverse chronologically (oldest cards last).
   */
  this.timeline_ = [];

  /**
   * Cards that have not been shown yet (they're to be displayed in the
   * future), and moved to `timeline_`.
   * Ordered chronologically (oldest cards first).
   */
  this.futureCards_ = [];

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

  this.updateTimeline_();

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
 * List of destinations, sorted chronologically (latest destinations last).
 * @return {!Array.<!SantaLocation>|null} a list of destinations, or null if the
 * service isn't ready.
 */
SantaService.prototype.getDestinations = function() {
  return this.destinations_.length ? this.destinations_ : null;
};

/**
 * List of cards sorted reverse chronologically (lastest cards first).
 * @return {!Array.<!StreamCard>|null} a list of cards, or null if the
 * service isn't ready.
 */
SantaService.prototype.getTimeline = function() {
  this.updateTimeline_();
  return this.timeline_;
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
 * @param {number} index The index that newDestinations should be spliced into
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
 * @param {number} index The index that newCards should be spliced into the
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
  // route, index will be 0 and the stream list will be truncated.
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
        this.kill_();
      }

      this.offset_ = result['now'] + result['timeOffset'] - new Date();
      if (result['switchOff']) {
        this.kill_();
      } else {
        this.resuscitate_();
      }

      var fingerprintChanged = result['fingerprint'] != this.fingerprint_;
      this.fingerprint_ = result['fingerprint'];
      this.clientSpecific_ = result['clientSpecific'];

      this.appendDestinations_(result['routeOffset'], result['destinations']);
      this.appendStream_(result['streamOffset'], result['stream']);
      this.rebuildTimeline_(fingerprintChanged);

      this.synced_ = true;
      this.syncInFlight_ = false;
      Events.trigger(this, 'sync');

      window.setTimeout(this.sync.bind(this), result['refresh']);

      if (opt_callback) {
        opt_callback();
      }
    }.bind(this),
    fail: function() {
      // TODO: perhaps trigger something other than kill, if a recovery can be
      // made.
      this.kill_();
    }.bind(this)
  });
};

/**
 * Collate the destination and card streams. Build the lists for timeline
 * (cards already shown) and future cards to show.
 * @param {boolean} forceDirty Force trigger of 'timeline_changed' event.
 * @private
 */
SantaService.prototype.rebuildTimeline_ = function(forceDirty) {
  var historyStream = [];
  var futureStream = [];
  var dests = this.destinations_.slice(0);
  var stream = this.stream_.slice(0);
  var now = this.now();
  while (dests.length && stream.length) {
    var toPush;
    if (!dests.length) {
      // No more destinations - push all of the stream cards.
      toPush = stream.shift();
    } else if (!stream.length) {
      // No more stream cards - push all of the destination cards.
      var dest = dests.shift();
      // Create a "card" for the stop.
      toPush = /** @type {!StreamCard} */({
        timestamp: dest.arrival,
        stop: dest
      });
    } else if (dests[0].arrival < stream[0].timestamp) {
      // Destination comes before the next stream card.
      var dest = dests.shift();
      // Create a "card" for the stop.
      toPush = /** @type {!StreamCard} */({
        timestamp: dest.arrival,
        stop: dest
      });
    } else {
      // Stream card comes before the next destination.
      toPush = stream.shift();
    }
    if (toPush.game && toPush.status) {
      // Trump status with game.
      toPush.status = null;
    }

    // Check whether the card would have already been shown or whether it is
    // scheduled to be shown in the future.
    if (toPush.timestamp < now) {
      // Insert at the beginning of the array.
      historyStream.unshift(toPush);
    } else {
      futureStream.push(toPush);
    }
  }
  var dirty = forceDirty || this.timeline_.length != historyStream.length;
  this.timeline_ = historyStream;
  this.futureCards_ = futureStream;

  if (dirty) {
    Events.trigger(this, 'timeline_changed', this.timeline_);
  }
};

/**
 * Ensures the timeline has all currently displayable cards.
 * @private
 */
SantaService.prototype.updateTimeline_ = function() {
  var now = this.now();
  var dirty = false;
  // Move any cards where the timestamp has elapsed onto the main feed
  // (this.timeline_)
  while (this.futureCards_.length && this.futureCards_[0].timestamp < now) {
    var card = this.futureCards_.shift();
    Events.trigger(this, 'card', card);
    // Insert at the beginning of the timeline.
    this.timeline_.unshift(card);
    dirty = true;
  }
  if (dirty) {
    Events.trigger(this, 'timeline_changed', this.timeline_);
  }
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
