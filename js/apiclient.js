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
   * @private {?string}
   */
  this.userLocation_ = null;

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
   * @private {boolean}
   */
  this.offline_ = false;

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
   * The next sync timeout.
   * @private {number}
   */
  this.syncTimeout_ = 0;

  /**
   * An extra offset determined by a URL parameter ("timestamp_override")
   *
   * @private {number|undefined}
   */
  this.debugOffset_;

  if (window['DEV']) {
    let overrideParam = getUrlParameter('timestamp_override');
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
 * @param {string} eventName
 * @param {function()} handler
 * @return {boolean} whether removed successfully
 * @export
 */
SantaService.prototype.removeListener = function(eventName, handler) {
  return Events.removeListener(this, eventName, handler);
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
  callback(/** @type {SantaState} */ ({
    position: null,
    presentsDelivered: 0,
    distanceTravelled: 0,
    heading: 0,
    prev: null,
    stopover: null,
    next: null,
  }));
};

/**
 * List of destinations, sorted chronologically (latest destinations last).
 *
 * @return {Array<!SantaLocation>} a list of destinations, or null if the
 * service isn't ready.
 * @export
 */
SantaService.prototype.getDestinations = function() {
  return null;
};

/**
 * List of cards sorted reverse chronologically (lastest cards first).
 *
 * @return {Array<!StreamCard>} a list of cards, or null if the
 * service isn't ready.
 * @export
 */
SantaService.prototype.getTimeline = function() {
  return null;
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
};

/**
 * @return {boolean} whether we're likely inside the EU
 * @export
 */
SantaService.prototype.getUserInEurope = function() {
  const loc = this.getUserLocation();
  if (!loc) {
    return true;  // can't be too sure
  }
  return !(loc.lng > 39.869 || loc.lng < -31.266 || loc.lat > 81.008 || loc.lat < 27.636);
};

/**
 * @return {string} the user's stop, or the empty string
 * @export
 */
SantaService.prototype.getUserStop = function() {
  return '';
};

/**
 * Returns the expected arrival time of Santa. This is not transformed by any offset.
 * @return {number} the expected arrival time of Santa, or zero if unknown
 * @export
 */
SantaService.prototype.getArrivalTime = function() {
  return 0;
};

/**
 * @return {!Array<!StreamCard>}
 * @export
 */
SantaService.prototype.getStream = function() {
  return [];
};

/**
 * Synchronize info with the server. This function returns immediately, the
 * synchronization is performed asynchronously.
 *
 * @export
 */
SantaService.prototype.sync = function() {
  if (this.syncInFlight_) {
    return;
  }
  this.syncInFlight_ = true;

  const data = {
    'rand': this.jitterRand_,
    'client': this.clientId_,
    'language': this.lang_,
  };

  const done = (result) => {
    let ok = true;
    if (result['status'] !== 'OK') {
      console.error('api', result['status']);
      this.kill_();
      ok = false;
    }

    this.offset_ = result['now'] + result['timeOffset'] - new Date();
    if (result['switchOff']) {
      this.kill_();
      ok = false;  // not technically offline, but let's pretend
    }

    if (result['upgradeToVersion'] && this.version_) {
      if (this.version_ < result['upgradeToVersion']) {
        console.warn('reload: this', this.version_, 'upgrade to', result['upgradeToVersion']);
        this.scheduleReload_();
      }
    }

    if (ok) {
      this.reconnect_();
    }

    this.userLocation_ = result['location'] || null;

    this.synced_ = true;
    this.syncInFlight_ = false;
    Events.trigger(this, 'sync');

    window.clearTimeout(this.syncTimeout_);
    this.syncTimeout_ = window.setTimeout(this.sync.bind(this), result['refresh']);
  };

  const fail = () => {
    this.syncInFlight_ = false;
    window.clearTimeout(this.syncTimeout_);
    this.syncTimeout_ = window.setTimeout(() => {
      // Sync after 60s, but only if the page is in the foreground.
      window.requestAnimationFrame(this.sync.bind(this));
    }, 60 * 1000);
    this.disconnect_();
  };

  santaAPIRequest('info', data, done, fail);
};

/**
 * Send the kill event, if not already killed.
 *
 * @private
 */
SantaService.prototype.kill_ = function() {
  if (!this.killed_) {
    this.killed_ = true;
    Events.trigger(this, 'kill');
  }
};

/**
 * Send the offline event, if not alreay offline.
 *
 * @private
 */
SantaService.prototype.disconnect_ = function() {
  if (!this.offline_) {
    this.offline_ = true;
    Events.trigger(this, 'offline');
  }
}

/**
 * Send the online event, if not already online.
 *
 * @private
 */
SantaService.prototype.reconnect_ = function() {
  if (this.offline_) {
    this.offline_ = false;
    Events.trigger(this, 'online');
  }
};

/**
 * Register to reload the page in a while, after the user has stopped clicking on it.
 *
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
 * @return {boolean} true if the service is offline.
 * @export
 */
SantaService.prototype.isOffline = function() {
  return this.offline_;
};
