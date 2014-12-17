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

// Exports (used by other components)
var Serv; // SantaService
Serv.prototype.addListener;
Serv.prototype.getCurrentLocation;
Serv.prototype.getDestinations;
Serv.prototype.getStream;
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
