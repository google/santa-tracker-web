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
