/**
 * @interface
 */
function SantaDetails() {};

/**
 * Time zone offset from UTC in seconds.
 *
 * @type {number}
 */
SantaDetails.prototype.timezone;

/**
 * @type {Array.<PanoramioPhoto>}
 */
SantaDetails.prototype.panoramio;

/**
 * @type {WikiInfo|undefined}
 */
SantaDetails.prototype.wikipedia;

/**
 * @type {StreetViewPano|undefined}
 */
SantaDetails.prototype.streetView;

/**
 * @type {WeatherForecast|undefined}
 */
SantaDetails.prototype.weather;

/**
 * @interface
 */
function PanoramioPhoto() {}

/**
 * @type {string}
 */
PanoramioPhoto.prototype.id;

/**
 * @type {string}
 */
PanoramioPhoto.prototype.authorId;

/**
 * @type {string}
 */
PanoramioPhoto.prototype.authorName;

/**
 * @interface
 */
function WikiInfo() {}

/**
 * @type {string}
 */
WikiInfo.prototype.title;

/**
 * @type {string}
 */
WikiInfo.prototype.excerpt;

/**
 * @type {string}
 */
WikiInfo.prototype.url;

/**
 * @interface
 */
function StreetViewPano() {}

/**
 * @type {string}
 */
StreetViewPano.prototype.id;

/**
 * @type {number}
 */
StreetViewPano.prototype.heading;

/**
 * @interface
 */
function WeatherForecast() {}

/**
 * @type {string}
 */
WeatherForecast.prototype.url;

/**
 * @type {number}
 */
WeatherForecast.prototype.tempC;

/**
 * @type {number}
 */
WeatherForecast.prototype.tempF;
