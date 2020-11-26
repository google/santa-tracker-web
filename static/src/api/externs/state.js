/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
