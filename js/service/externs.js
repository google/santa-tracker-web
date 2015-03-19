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

// Externs from backend service.
var Loc;
Loc.prototype.arrival;
Loc.prototype.departure;
Loc.prototype.presentsDelivered;
Loc.prototype.population;
Loc.prototype.city;
Loc.prototype.region;
Loc.prototype.id;
Loc.prototype.location;
var LL;
LL.prototype.lat;
LL.prototype.lng;
var Detail;
Detail.prototype.timezone;
Detail.prototype.weather;
Detail.prototype.panoramio;
Detail.prototype.wikipedia;
Detail.prototype.streetView;
var Weather;
Weather.prototype.url;
Weather.prototype.tempC;
Weather.prototype.tempF;
var Photo;
Photo.prototype.id;
Photo.prototype.authorId;
Photo.prototype.authorName;
var Wiki;
Wiki.prototype.title;
Wiki.prototype.excerpt;
Wiki.prototype.url;
var Pano;
Pano.prototype.id;
Pano.prototype.heading;
var Card;
Card.prototype.timestamp;
Card.prototype.didyouknow;
Card.prototype.youtubeId;
Card.prototype.imageUrl;
Card.prototype.status;
Card.prototype.game;
Card.prototype.stop;
Card.prototype.type;

// Exports (used by other components)
var Serv; // SantaService
Serv.prototype.addListener;
Serv.prototype.getCurrentLocation;
Serv.prototype.getDestinations;
Serv.prototype.getTimeline;
Serv.prototype.sync;
Serv.prototype.now;
Serv.prototype.dateNow;
Serv.prototype.isSynced;
Serv.prototype.isKilled;
Serv.prototype.getClientSpecific;
var Ev; // Events
Ev.prototype.addListener;
Ev.prototype.trigger;
var State; // SantaState
State.prototype.position;
State.prototype.heading;
State.prototype.prev;
State.prototype.stopover;
State.prototype.next;
State.prototype.presentsDelivered;
State.prototype.distanceTravelled;
var Spher; // Spherical
Spher.prototype.computeDistanceBetween;
var SantaLoc; // SantaLocation
SantaLoc.prototype.getDetails;
//SantaLoc.prototype.distanceTo;
//SantaLoc.prototype.getLocation;
//SantaLoc.prototype.getDistanceTravelled;
