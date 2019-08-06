/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.provide('app.ImageItemOrnamentRound2');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Round ornament 2 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentRound2 = function() {
  app.SVGImage.call(this);

  this.width = 51.4;
  this.height = 59.6;
};
app.ImageItemOrnamentRound2.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentRound2.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 51.41 59.61" width="51.41" height="59.61"><defs><style>.cls-1,.cls-5,.cls-7,.cls-8{fill:none;}.cls-2{fill:' + color + ';}.cls-3{fill:#231f20;opacity:0.1;}.cls-4{fill:#607d8b;}.cls-5{stroke:#607d8b;stroke-width:1.03px;}.cls-5,.cls-7,.cls-8{stroke-miterlimit:10;}.cls-6{clip-path:url(#clip-path);}.cls-7,.cls-8{stroke:#fff;}.cls-7{stroke-width:2.84px;}.cls-8{stroke-linecap:round;stroke-width:1.06px;}</style><clipPath id="clip-path"><path class="cls-1" d="M29.9,15.63V11.3H22.3v4.35a22.18,22.18,0,1,0,7.6,0Z"/></clipPath></defs><path class="cls-2" d="M29.9,15.63V11.3H22.3v4.35a22.18,22.18,0,1,0,7.6,0Z"/><path class="cls-3" d="M41.79,21.74a22.07,22.07,0,0,0-12.15-6.15V11.3H25.83v4A24.37,24.37,0,0,1,26,59.61,22.15,22.15,0,0,0,41.79,21.74Z"/><path class="cls-4" d="M21.9,8.73a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.11.11,0,0,1,.15,0l1.32,1.32a.1.1,0,0,0,.14,0L29,13.18a.1.1,0,0,1,.14,0L30.4,14.4a.1.1,0,0,0,.17-.07V8.83a.09.09,0,0,0-.1-.1Z"/><path class="cls-5" d="M26.44,12.25V2.45A1.92,1.92,0,0,0,24.51.52h0a1.93,1.93,0,0,0-1.93,1.93V5.24"/><g class="cls-6"><line class="cls-7" y1="28.96" x2="51.41" y2="28.96"/><line class="cls-7" y1="45.32" x2="51.41" y2="45.32"/><line class="cls-8" x1="11.66" y1="35.97" x2="16.14" y2="38.56"/><line class="cls-8" x1="11.66" y1="38.56" x2="16.14" y2="35.97"/><line class="cls-8" x1="13.9" y1="39.85" x2="13.9" y2="34.68"/><line class="cls-8" x1="23.88" y1="35.97" x2="28.36" y2="38.56"/><line class="cls-8" x1="23.88" y1="38.56" x2="28.36" y2="35.97"/><line class="cls-8" x1="26.12" y1="39.85" x2="26.12" y2="34.68"/><line class="cls-8" x1="36.09" y1="35.97" x2="40.58" y2="38.56"/><line class="cls-8" x1="36.09" y1="38.56" x2="40.58" y2="35.97"/><line class="cls-8" x1="38.34" y1="39.85" x2="38.34" y2="34.68"/><circle class="cls-1" cx="32.27" cy="37.23" r="1.42"/><circle class="cls-1" cx="19.94" cy="37.23" r="1.42"/><circle class="cls-1" cx="7.86" cy="37.23" r="1.42"/><circle class="cls-1" cx="44.48" cy="37.23" r="1.42"/></g></svg>';
  return data;
};
