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

goog.provide('app.ImageItemOrnamentRound1');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Round ornament 1 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentRound1 = function() {
  app.SVGImage.call(this);

  this.width = 44.6;
  this.height = 59.6;
};
app.ImageItemOrnamentRound1.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentRound1.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44.57 59.61" width="44.57" height="59.61"><defs><style>.cls-1{fill:' + color + ';}.cls-2{fill:#231f20;opacity:0.1;}.cls-3{fill:#607d8b;}.cls-4{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M25.87,15.63V11.3H18.26v4.35a22.18,22.18,0,1,0,7.61,0Z"/><path class="cls-2" d="M38,21.74a22,22,0,0,0-12.15-6.15V11.3h-3.8v4a24.38,24.38,0,0,1,.17,44.29A22.15,22.15,0,0,0,38,21.74Z"/><path class="cls-3" d="M17.78,8.73a.1.1,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.11.11,0,0,0,.15,0L22,13.18a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0l1.22,1.22a.1.1,0,0,0,.17-.07V8.83a.09.09,0,0,0-.1-.1Z"/><path class="cls-4" d="M22.33,12.25V2.45A1.93,1.93,0,0,0,20.4.52h0a1.92,1.92,0,0,0-1.93,1.93V5.24"/></svg>';
  return data;
};
