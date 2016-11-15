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
 * @fileoverview
 * Shared JavaScript client for the Santa Tracker API.
 */

goog.provide('SantaService');

/**
 * Creates a new Santa service object.
 *
 * @param {string} clientId
 * @param {string} lang
 * @param {string} version
 * @constructor
 * @export
 */
SantaService = function SantaService(clientId, lang, version) {
  /** @private {string} */
  this.lang_ = lang;

  /** @const @private {string} */
  this.version_ = version;

  /**
   * The user's (optional) location on the Earth, from geo-ip.
   */
  this.userLocation_ = null;

  /**
   * All known destinations (including future ones).
   * Ordered chronologically (oldest destinations first).
   * @private {!Array<!SantaLocation>}
   */
  this.destinations_ = [];

  /**
   * Stream of cards (e.g. didyouknow, etc) but not destinations.
   * Ordered chronologically (oldest cards first).
   * @private {!Array<!StreamCard>}
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

  /** Bound version of `fetchDetails_`. */
  this.boundFetchDetails_ = this.fetchDetails_.bind(this);

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
   * Santa's next stop. Used to determine whether to trigger the "next stop"
   * card.
   * @private {SantaLocation}
   */
  this.nextStop_ = null;

  /**
   * An extra offset determined by a URL parameter ("timestamp_override")
   *
   * @private {number|undefined}
   */
  this.debugOffset_;

  if (window['DEV']) {
    var overrideParam = getUrlParameter('timestamp_override');
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
 * @param {function()} handler
 * @export
 */
SantaService.prototype.addListener = function(eventName, handler) {
  return Events.addListener(this, eventName, handler);
};

/**
 * @param {string} lang to set
 * @export
 */
SantaService.prototype.setLang = function(lang) {
  this.lang_ = lang;
};


/**
 * @param {function(SantaState)} callback
 * @export
 */
SantaService.prototype.getCurrentLocation = function(callback) {
  var now = this.now();
  var dest = this.findDestination_(now);
  if (!this.isSynced()) {
    this.sync(() => {
      this.getCurrentLocation(callback);
    });
    return;
  }

  this.updateTimeline_();

  // TODO: handle dest == null
  if (dest == null) {
    console.warn('no destination');
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

  // After Santa has left the stop, trigger the next stop card.
  if (!this.nextStop_ || this.nextStop_.id != next.id) {
    Events.trigger(this, 'card', /** @type {!StreamCard} */({
      type: 'city',
      timestamp: now,
      stop: next
    }));
  }
  this.nextStop_ = next;
};

/**
 * @const
 * @private
 */
SantaService.prototype.PRESENTS_OVER_WATER_ = .3;

/**
 * @const
 */
SantaService.prototype.PRESENTS_IN_CITY = 1 - SantaService.prototype.PRESENTS_OVER_WATER_;

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
 * @return {Array<!SantaLocation>} a list of destinations, or null if the
 * service isn't ready.
 * @export
 */
SantaService.prototype.getDestinations = function() {
  return this.destinations_.length ? this.destinations_ : null;
};

/**
 * List of cards sorted reverse chronologically (lastest cards first).
 * @return {Array<!StreamCard>} a list of cards, or null if the
 * service isn't ready.
 * @export
 */
SantaService.prototype.getTimeline = function() {
  this.updateTimeline_();
  return this.timeline_;
};

/**
 * @return {?LatLng} the user's location
 * @export
 */
SantaService.prototype.getUserLocation = function() {
  if (!this.userLocation_) {
    return null;
  }
  var parts = this.userLocation_.split(',');
  if (parts.length != 2) {
    return null;
  }
  return {lat: +parts[0], lng: +parts[1]};
}

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
 * @param {!Array<!SantaLocation>} newDestinations
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
 * @param {!Array<!StreamCard>} newCards
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
  const data = {
    'id': id,
    'language': this.lang_,
    'fingerprint': this.fingerprint_,
  };

  function done(result) {
    if (result['status'] != 'OK') {
      console.error(result, result['status']);
      return;
    }
    callback(/** @type {SantaDetails} */ (result['details']));
  }
  function fail() {
    console.error('failed fetchDetails', id);
  }
  santaAPIRequest('details', data, done, fail);
};

/**
 * Synchronize info with the server. This function returns immediately, the
 * synchronization is performed asynchronously.
 *
 * @param {function()} opt_callback
 * @export
 */
SantaService.prototype.sync = function(opt_callback) {
  if (this.syncInFlight_ && opt_callback) {
    this.addListener('sync', opt_callback);
    return;
  }
  this.syncInFlight_ = true;

  const data = {
    'rand': this.jitterRand_,
    'client': this.clientId_,
    'language': this.lang_,
    // If this fingerprint doesn't match the servers, the server will replace
    // the route and status message text.
    'fingerprint': this.fingerprint_,
    'routeOffset': this.destinations_.length,
    'streamOffset': this.stream_.length,
  };

  const done = result => {
    if (result['status'] != 'OK') {
      console.error(result['status']);
      this.kill_();
    }

    this.offset_ = result['now'] + result['timeOffset'] - new Date();
    if (result['switchOff']) {
      this.kill_();
    } else {
      this.resuscitate_();
    }

    if (result['upgradeToVersion'] && this.version_) {
      if (this.version_ < result['upgradeToVersion']) {
        console.warn('reload: this', this.version_, 'upgrade to', result['upgradeToVersion']);
        this.scheduleReload_();
      }
    }

    var fingerprintChanged = result['fingerprint'] != this.fingerprint_;
    this.fingerprint_ = result['fingerprint'];
    this.clientSpecific_ = result['clientSpecific'];
    this.userLocation_ = result['location'] || null;

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
  };

  const fail = () => {
    // TODO: perhaps trigger something other than kill, if a recovery can be made.
    this.kill_();
  };

  santaAPIRequest('info', data, done, fail);
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
        stop: dest,
        type: 'city'
      });
    } else if (dests[0].arrival < stream[0].timestamp) {
      // Destination comes before the next stream card.
      var dest = dests.shift();
      // Create a "card" for the stop.
      toPush = /** @type {!StreamCard} */({
        timestamp: dest.arrival,
        stop: dest,
        type: 'city'
      });
    } else {
      // Stream card comes before the next destination.
      toPush = stream.shift();
    }
    if (toPush.game && toPush.status) {
      // Trump status with game.
      toPush.status = undefined;
    }
    if (toPush.game) {
      toPush.type = 'scene';
    } else if (toPush.youtubeId) {
      toPush.type = 'video';
    } else if (toPush.imageUrl) {
      toPush.type = 'photos';
    } else if (toPush.status) {
      toPush.type = 'update';
    } else if (toPush.didyouknow) {
      toPush.type = 'facts';
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
    if (!card.stop) {
      Events.trigger(this, 'card', card);
    }
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
 * Register to reload the page in a while, after the user has stopped clicking
 * on it.
 * @private
 */
SantaService.prototype.scheduleReload_ = function() {
  Events.trigger(this, 'reload');
};


/**
 * @return {number}
 * @export
 */
SantaService.prototype.now = function() {
  return +new Date() + (this.debugOffset_ || this.offset_ || 0);
};

/**
 * @return {!Date}
 * @export
 */
SantaService.prototype.dateNow = function() {
  return new Date(this.now());
};

/**
 * @return {boolean} true if time has been synchronized with the server.
 * @export
 */
SantaService.prototype.isSynced = function() {
  return this.synced_;
};

/**
 * @return {boolean} true if the service has been killed.
 * @export
 */
SantaService.prototype.isKilled = function() {
  return this.killed_;
};

/**
 * Client-specific kill switches.
 * For example, the website has a flag to disable the Google earth button.
 * @return {!Object}
 * @export
 */
SantaService.prototype.getClientSpecific = function() {
  return this.clientSpecific_ || {};
};
