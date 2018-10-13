/**
 * @externs
 */


/**
 * @typedef {{
 *   position: !LatLng,
 *   heading: number,
 *   presentsDelivered: number,
 *   distanceTravelled: number,
 *   distanceToUser: number,
 *   userDestination: ?SantaLocation,
 *   arrivalTime: number,
 *   prev: !SantaLocation,
 *   stopover: ?SantaLocation,
 *   next: !SantaLocation,
 *   dests: !Array<SantaLocation>,
 *   stream: ?StreamUpdate,
 * }}
 */
var SantaState;


/**
 * @typedef {{
 *   timestamp: number,
 *   type: string,
 *   message: string,
 * }}
 */
var StreamUpdate;


/**
 * @typedef {{
 *   timezone: number,
 *   panoramio: !Array<*>,
 *   wikipedia: ?WikiInfo,
 *   streetView: ?StreetViewPano,
 *   weather: ?WeatherForecast,
 * }}
 */
var SantaDetails;


/**
 * @typedef {{
 *   title: string,
 *   excerpt: string,
 *   url: string,
 * }}
 */
var WikiInfo;


/**
 * @typedef {{
 *   id: string,
 *   heading: number,
 * }}
 */
var StreetViewPano;


/**
 * @typedef {{
 *   url: string,
 *   tempC: number,
 *   tempF: number,
 * }}
 */
var WeatherForecast;
