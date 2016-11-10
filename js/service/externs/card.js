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
 * @externs
 */


/**
 * StreamCard represents a non-destination entry in Santa's feed.
 * @interface
 */
function StreamCard() {};

/**
 * Time at which the card should be shown. Milliseconds since UNIX epoch.
 * @type {number}
 */
StreamCard.prototype.timestamp;

/**
 * If present, show a piece of trivia.
 *
 * @type {string|undefined}
 */
StreamCard.prototype.didyouknow;

/**
 * If present, show a YouTube video with given YouTube ID.
 * @type {string|undefined}
 */
StreamCard.prototype.youtubeId;

/**
 * If present, show an image with given URL.
 * @type {string|undefined}
 */
StreamCard.prototype.imageUrl;

/**
 * If present, show a jovial status message from Santa.
 * @type {string|undefined}
 */
StreamCard.prototype.status;

/**
 * If present, show a card with details about a location.
 * @type {SantaLocation|undefined}
 */
StreamCard.prototype.stop;

/**
 * The type of card. One of stop, scene, video, photos, update, facts.
 * @type {string}
 */
StreamCard.prototype.type;
