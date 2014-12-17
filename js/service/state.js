/**
 * @interface
 */
function SantaState() {}

/**
 * @type {LatLng}
 */
SantaState.prototype.position;

/**
 * @type {number}
 */
SantaState.prototype.heading;

/**
 * @type {SantaLocation}
 */
SantaState.prototype.prev;

/**
 * null when Santa is flying.
 * @type {SantaLocation}
 */
SantaState.prototype.stopover;

/**
 * @type {SantaLocation}
 */
SantaState.prototype.next;

/**
 * @type {number}
 */
SantaState.prototype.presentsDelivered;

/**
 * Distance in metres.
 * @type {number}
 */
SantaState.prototype.distanceTravelled;
