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

  var overrideParam = this.getUrlParameter_('timestamp_override');
  if (overrideParam) {
    if (overrideParam[overrideParam.length - 1] == '/') {
      overrideParam = overrideParam.slice(0, -1);
    }
    this.debugOffset_ = overrideParam - new Date();
  }

  this.init_(); // Fake Santa.
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
                                              this.returnDetails_(destination),
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
 * @param {!SantaLocation} location
 * @return {function(function(SantaDetails))}
 */
SantaService.prototype.returnDetails_ = function(location) {
  return function(callback) {
    callback(location.details);
  }
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
  Events.trigger(this, 'sync');
  opt_callback();
};

SantaService.prototype.init_ = function() {
  this.appendDestinations_(0, this.DESTS_);
  this.appendStream_(0, this.STREAM_);
  this.rebuildTimeline_(true);
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
      toPush.status = null;
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
 * @return {number}
 */
SantaService.prototype.now = function() {
  return +new Date() + this.debugOffset_;
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
  return true;
};

/**
 * @return {boolean} true if the service has been killed.
 */
SantaService.prototype.isKilled = function() {
  return false;
};

/**
 * Client-specific kill switches.
 * For example, the website has a flag to disable the Google earth button.
 * @return {!Object}
 */
SantaService.prototype.getClientSpecific = function() {
  return this.clientSpecific_ || {};
};

SantaService.prototype.DESTS_ = [
  {
    "id": "takeoff",
    "arrival": 0,
    "departure": 1419415200000,
    "presentsDelivered": 0,
    "city": "North Pole",
    "region": "Arctic",
    "location": {
      "lat": 84.6,
      "lng": 168
    },
    "details": {
      "timezone": null,
      "altitude": 0,
      "hasWiki": true,
      "weather": {
        "url": "http://en.wikipedia.org/wiki/North_Pole",
        "tempC": -34,
        "tempF": -29.2
      },
      "streetView": {
        "id": "Gos_CbqbEewAAAQIt2D7cw",
        "latitude": 0,
        "longitude": 0,
        "heading": 399
      }
    }
  },
  {
    "id": "provideniya",
    "arrival": 1419419340000,
    "departure": 1419419400000,
    "presentsDelivered": 46415,
    "city": "Provideniya",
    "region": "Russia",
    "location": {
      "lat": 64.436249,
      "lng": -173.233337
    },
    "details": {
      "timezone": 43200,
      "altitude": 0,
      "hasWiki": true,
      "weather": {
        "url": "http://www.wunderground.com/global/stations/25594.html",
        "tempC": -15,
        "tempF": 5
      }
    }
  },
  {
    "id": "sydney",
    "arrival": 1419419520000,
    "departure": 1419419580000,
    "presentsDelivered": 146084997,
    "city": "Sydney",
    "region": "Australia",
    "location": {
      "lat": -33.867139,
      "lng": 151.207114
    },
    "details": {
      "timezone": 39600,
      "altitude": 0,
      "hasWiki": true,
      "photos": [
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-aqXb1X9SKFc@U5qd_Fe-AkI.jpg",
          "attributionHtml": "\u0026copy; Russell Charters"
        },
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-0DLrZa-sGAs@S3_uxzRi9lI.jpg",
          "attributionHtml": "\u0026copy; Cristhian Daniel Parra Trepowski"
        }
      ],
      "weather": {
        "url": "http://www.wunderground.com/global/stations/94768.html",
        "tempC": 22.7,
        "tempF": 72.9
      },
      "streetView": {
        "id": "4AulV5EFK8UAAAQIuBjdTw",
        "latitude": 0,
        "longitude": 0,
        "heading": 493
      },
      "gmmStreetView": {
        "id": "bqhNHFVG7GL_kE0DBhwd7w",
        "latitude": -33.854843,
        "longitude": 151.210005,
        "heading": 18.57
      }
    }
  },
  {
    "id": "fuji",
    "arrival": 1419419700000,
    "departure": 1419419760000,
    "presentsDelivered": 327458745,
    "city": "Mt Fuji",
    "region": "Japan",
    "location": {
      "lat": 35.36497,
      "lng": 138.731275
    },
    "details": {
      "timezone": 32400,
      "altitude": 0,
      "hasWiki": true,
      "photos": [
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-3X-eVKIhRCU@UZz_B6sCMNI.jpg",
          "attributionHtml": "\u0026copy; Benjamin Decavel"
        },
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-OMCib5zWOmw@SWl3hrzYcXI.jpg",
          "attributionHtml": "\u0026copy; Yobito KAYANUMA"
        }
      ],
      "weather": {
        "url": "http://www.wunderground.com/global/stations/47634.html",
        "tempC": 10.1,
        "tempF": 50.2
      },
      "streetView": {
        "id": "OggKqMC1jYgosZJ1AaIBKg",
        "latitude": 0,
        "longitude": 0,
        "heading": 110
      },
      "gmmStreetView": {
        "id": "XvEfGr6duf-8MWgptiw1xQ",
        "latitude": 35.319047,
        "longitude": 138.591156,
        "heading": 308.01
      }
    }
  },
  {
    "id": "rome",
    "arrival": 1419419880000,
    "departure": 1419419940000,
    "presentsDelivered": 4552226124,
    "city": "Rome",
    "region": "Italy",
    "location": {
      "lat": 41.895466,
      "lng": 12.482324
    },
    "details": {
      "timezone": 3600,
      "altitude": 0,
      "hasWiki": true,
      "photos": [
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-fPiYrATKT1w@U1EOQGIbOyI.jpg",
          "attributionHtml": "\u0026copy; B\u0026B Roma Central"
        },
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-k1M4xmyzC5s@UcVjzCEjsII.jpg",
          "attributionHtml": "\u0026copy; Pedro D'Almeida"
        }
      ],
      "weather": {
        "url": "http://www.wunderground.com/global/stations/16240.html",
        "tempC": 5.9,
        "tempF": 42.6
      },
      "streetView": {
        "id": "29ccAtkcnh4AAAQIt98YEg",
        "latitude": 0,
        "longitude": 0,
        "heading": 362
      },
      "gmmStreetView": {
        "id": "HPf4LqkulqmwX_MfznH-tg",
        "latitude": 41.897817,
        "longitude": 12.473177,
        "heading": 16.23
      }
    }
  },
  {
    "id": "san_francisco",
    "arrival": 1419420000000,
    "departure": 1419420060000,
    "presentsDelivered": 7017759296,
    "city": "San Francisco",
    "region": "California, United States",
    "location": {
      "lat": 37.775196,
      "lng": -122.419204
    },
    "details": {
      "timezone": -28800,
      "altitude": 0,
      "hasWiki": true,
      "photos": [
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-ZpKKJYkqobU@ULk2lb2yh5I.jpg",
          "attributionHtml": "\u0026copy; Mustafa Ercetin"
        },
        {
          "url": "https://maps.gstatic.com/mapfiles/santatracker/place_images_1x/i-_Y31p2OhC7Q@UPxdfQp7TTI.jpg",
          "attributionHtml": "\u0026copy; Pam Boling"
        }
      ],
      "weather": {
        "url": "http://www.wunderground.com/US/CA/San_Francisco.html",
        "tempC": 13.2,
        "tempF": 55.7
      },
      "streetView": {
        "id": "H2dXnHLBuwUAAAQIt6Cm6g",
        "latitude": 0,
        "longitude": 0,
        "heading": 360
      },
      "gmmStreetView": {
        "id": "lADjYX9Jmar90fk1OlL1Ig",
        "latitude": 37.809263,
        "longitude": -122.47012,
        "heading": 309.63
      }
    }
  },
  {
    "id": "landing",
    "arrival": 1419420120000,
    "departure": 1450951200000,
    "presentsDelivered": 7056276203,
    "city": "North Pole",
    "region": "Arctic",
    "location": {
      "lat": 84.6,
      "lng": 168
    },
    "details": {
      "timezone": null,
      "altitude": 0,
      "hasWiki": true,
      "weather": {
        "url": "http://en.wikipedia.org/wiki/North_Pole",
        "tempC": -34,
        "tempF": -29.2
      }
    }
  }
];

SantaService.prototype.STREAM_ = [
  {
    "timestamp": 1419415243152,
    "status": "Just getting started"
  },
  {
    "timestamp": 1419415278979,
    "status": "All bundled up and ready for take off!"
  },
  {
    "timestamp": 1419415336773,
    "status": "Checking his list"
  },
  {
    "timestamp": 1419415392975,
    "didyouknow": "The North Pole, home to Santa Claus himself,  is located in the middle of the Arctic Ocean."
  },
  {
    "timestamp": 1419415429038,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_babybird-01.png"
  },
  {
    "timestamp": 1419415471494,
    "status": "Sleigh bells ringing, are you listening?",
    "game": "matching"
  },
  {
    "timestamp": 1419415514910,
    "status": "I hope someone left out some carrots, Dasher is hungry"
  },
  {
    "timestamp": 1419415550208,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419415586457,
    "status": "I'm getting a little too big for these chimneys!",
    "game": "gumball"
  },
  {
    "timestamp": 1419415644796,
    "status": "Belly full of cookies",
    "game": "santaselfie"
  },
  {
    "timestamp": 1419415681742,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419415714392,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_badsweater-01.png"
  },
  {
    "timestamp": 1419415761272,
    "youtubeId": "IXmDOu-eSx4"
  },
  {
    "timestamp": 1419415808039,
    "youtubeId": "vHMeXs36NTE"
  },
  {
    "timestamp": 1419415844818,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_catchsnow3-01.png"
  },
  {
    "timestamp": 1419415893992,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_closecall-01.png"
  },
  {
    "timestamp": 1419415934969,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_dance-01.png"
  },
  {
    "timestamp": 1419415991883,
    "youtubeId": "ZJPL56IPTjw"
  },
  {
    "timestamp": 1419416051518,
    "youtubeId": "uEl2WIZOVdQ"
  },
  {
    "timestamp": 1419416086160,
    "youtubeId": "2FtcJJ9vzVQ"
  },
  {
    "timestamp": 1419416145520,
    "status": "Mmmm, those cookies were delicious!"
  },
  {
    "timestamp": 1419416192998,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_dog-01.png"
  },
  {
    "timestamp": 1419416243991,
    "status": "Feeling energized after those cookies and milk",
    "game": "mercator"
  },
  {
    "timestamp": 1419416277402,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_elfpower-01.png"
  },
  {
    "timestamp": 1419416315866,
    "youtubeId": "sQnKCU_A0Yc"
  },
  {
    "timestamp": 1419416350385,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_empty-01.png"
  },
  {
    "timestamp": 1419416384381,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419416424071,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_feetup-01.png"
  },
  {
    "timestamp": 1419416472368,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419416522277,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_fireplacehangout-01.png"
  },
  {
    "timestamp": 1419416558748,
    "status": "Excited and energized"
  },
  {
    "timestamp": 1419416614790,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_grocery-01.png"
  },
  {
    "timestamp": 1419416668376,
    "status": "Going fast!",
    "game": "jamband"
  },
  {
    "timestamp": 1419416720882,
    "status": "Lots of good little girls and boys this year!",
    "game": "codelab"
  },
  {
    "timestamp": 1419416771749,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_hanginthere-01.png"
  },
  {
    "timestamp": 1419416822822,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_higheel-01.png"
  },
  {
    "timestamp": 1419416872335,
    "status": "Happy holidays everyone!"
  },
  {
    "timestamp": 1419416924157,
    "youtubeId": "IXmDOu-eSx4"
  },
  {
    "timestamp": 1419416980172,
    "status": "Holding on to his hat!"
  },
  {
    "timestamp": 1419417016175,
    "status": "Ho ho ho!",
    "game": "latlong"
  },
  {
    "timestamp": 1419417061773,
    "youtubeId": "vHMeXs36NTE"
  },
  {
    "timestamp": 1419417113406,
    "youtubeId": "ZJPL56IPTjw"
  },
  {
    "timestamp": 1419417161867,
    "youtubeId": "uEl2WIZOVdQ"
  },
  {
    "timestamp": 1419417203596,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_hotcoco-01.png"
  },
  {
    "timestamp": 1419417250414,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_hungup-01.png"
  },
  {
    "timestamp": 1419417302388,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_icecarving-01.png"
  },
  {
    "timestamp": 1419417338864,
    "youtubeId": "2FtcJJ9vzVQ"
  },
  {
    "timestamp": 1419417388678,
    "status": "Ho ho ho! This is my favorite day of the year"
  },
  {
    "timestamp": 1419417424377,
    "youtubeId": "sQnKCU_A0Yc"
  },
  {
    "timestamp": 1419417474989,
    "status": "Quick pit stop for some hot chocolate"
  },
  {
    "timestamp": 1419417507213,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_icecycle-01.png"
  },
  {
    "timestamp": 1419417548933,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419417601609,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_igloo2-01.png"
  },
  {
    "timestamp": 1419417632053,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_infrontofmoon-01.png"
  },
  {
    "timestamp": 1419417684828,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_inthebag-01.png"
  },
  {
    "timestamp": 1419417727977,
    "status": "Jingling all the way!",
    "game": "glider"
  },
  {
    "timestamp": 1419417777594,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_kiss-01.png"
  },
  {
    "timestamp": 1419417837010,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_ladybug-01.png"
  },
  {
    "timestamp": 1419417883455,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419417932467,
    "youtubeId": "IXmDOu-eSx4"
  },
  {
    "timestamp": 1419417972715,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_metafriend-01.png"
  },
  {
    "timestamp": 1419418020020,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_milkandcookies-01.png"
  },
  {
    "timestamp": 1419418079978,
    "status": "Full of joy"
  },
  {
    "timestamp": 1419418136766,
    "youtubeId": "vHMeXs36NTE"
  },
  {
    "timestamp": 1419418168285,
    "youtubeId": "ZJPL56IPTjw"
  },
  {
    "timestamp": 1419418227062,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_mustache-01.png"
  },
  {
    "timestamp": 1419418263777,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_nightsky-01.png"
  },
  {
    "timestamp": 1419418321648,
    "youtubeId": "uEl2WIZOVdQ"
  },
  {
    "timestamp": 1419418352267,
    "youtubeId": "2FtcJJ9vzVQ"
  },
  {
    "timestamp": 1419418402687,
    "status": "Feeling the magic",
    "game": "seasonofgiving"
  },
  {
    "timestamp": 1419418453757,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_palmtree-01.png"
  },
  {
    "timestamp": 1419418493836,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_phonepole-01.png"
  },
  {
    "timestamp": 1419418547076,
    "youtubeId": "sQnKCU_A0Yc"
  },
  {
    "timestamp": 1419418584645,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_pyramid-01.png"
  },
  {
    "timestamp": 1419418628100,
    "status": "On track with Rudolph leading the way",
    "game": "village"
  },
  {
    "timestamp": 1419418676611,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419418724767,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_reindeercuddle-01.png"
  },
  {
    "timestamp": 1419418759128,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_route66-01.png"
  },
  {
    "timestamp": 1419418804133,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419418849190,
    "youtubeId": "IXmDOu-eSx4"
  },
  {
    "timestamp": 1419418890653,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_SadTree-01.png"
  },
  {
    "timestamp": 1419418935962,
    "status": "Rudolph's nose just turned red!",
    "game": "runner"
  },
  {
    "timestamp": 1419418984659,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santaarms-01.png"
  },
  {
    "timestamp": 1419419033291,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santacrack-01.png"
  },
  {
    "timestamp": 1419419075140,
    "status": "The new sleigh is working great"
  },
  {
    "timestamp": 1419419125737,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santahide-01.png"
  },
  {
    "timestamp": 1419419180781,
    "youtubeId": "vHMeXs36NTE"
  },
  {
    "timestamp": 1419419230156,
    "status": "Still smiling!",
    "game": "matching"
  },
  {
    "timestamp": 1419419273134,
    "youtubeId": "ZJPL56IPTjw"
  },
  {
    "timestamp": 1419419314892,
    "youtubeId": "uEl2WIZOVdQ"
  },
  {
    "timestamp": 1419419353338,
    "youtubeId": "2FtcJJ9vzVQ"
  },
  {
    "timestamp": 1419419398948,
    "youtubeId": "sQnKCU_A0Yc"
  },
  {
    "timestamp": 1419419453199,
    "didyouknow": "The Lena River drains into the Laptev Sea. "
  },
  {
    "timestamp": 1419419492324,
    "didyouknow": "Brrr! Both the Kara Sea and the East Siberian Sea are part of the Arctic Ocean."
  },
  {
    "timestamp": 1419419540686,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419419578688,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419419622052,
    "status": "Dashing through the snow"
  },
  {
    "timestamp": 1419419676887,
    "youtubeId": "IXmDOu-eSx4"
  },
  {
    "timestamp": 1419419715799,
    "status": "Feeling thirsty, anyone have any milk?"
  },
  {
    "timestamp": 1419419751931,
    "youtubeId": "vHMeXs36NTE"
  },
  {
    "timestamp": 1419419793753,
    "didyouknow": "Currently, the Kamchatka Current is part of the Pacific Ocean."
  },
  {
    "timestamp": 1419419852896,
    "status": "Sleigh bells ringing, are you listening?",
    "game": "gumball"
  },
  {
    "timestamp": 1419419896370,
    "youtubeId": "ZJPL56IPTjw"
  },
  {
    "timestamp": 1419419929407,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santasCoat-01.png"
  },
  {
    "timestamp": 1419419984387,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santasled-01.png"
  },
  {
    "timestamp": 1419420040126,
    "youtubeId": "uEl2WIZOVdQ"
  },
  {
    "timestamp": 1419420097737,
    "didyouknow": "Save the date! Most of the international date line runs through the middle of the Pacific Ocean."
  },
  {
    "timestamp": 1419420153341,
    "status": "I hope someone left out some carrots, Dasher is hungry"
  },
  {
    "timestamp": 1419420228929,
    "youtubeId": "2FtcJJ9vzVQ"
  },
  {
    "timestamp": 1419420263445,
    "status": "I'm getting a little too big for these chimneys!"
  },
  {
    "timestamp": 1419420340431,
    "status": "Belly full of cookies",
    "game": "santaselfie"
  },
  {
    "timestamp": 1419420399132,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_santaticket-01.png"
  },
  {
    "timestamp": 1419420444707,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_scoops-01.png"
  },
  {
    "timestamp": 1419420522085,
    "status": "Mmmm, those cookies were delicious!"
  },
  {
    "timestamp": 1419420554197,
    "status": "Feeling energized after those cookies and milk",
    "game": "mercator"
  },
  {
    "timestamp": 1419420598046,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_shadow-01.png"
  },
  {
    "timestamp": 1419420645041,
    "status": "Excited and energized"
  },
  {
    "timestamp": 1419420697289,
    "didyouknow": "New Zealand lies southeast of Australia and is a leading producer of wool."
  },
  {
    "timestamp": 1419420756466,
    "youtubeId": "sQnKCU_A0Yc"
  },
  {
    "timestamp": 1419420814212,
    "youtubeId": "2UGX3bT9u20"
  },
  {
    "timestamp": 1419420878679,
    "didyouknow": "New Zealand, home to millions of people and even more sheep, is an island country in the Pacific Ocean."
  },
  {
    "timestamp": 1419420931918,
    "youtubeId": "_WdYujHlmHA"
  },
  {
    "timestamp": 1419420974859,
    "imageUrl": "https://santatracker.google.com/images/cards/cityfeed_snowangles-01.png"
  }
];
window['SantaService'] = SantaService;
