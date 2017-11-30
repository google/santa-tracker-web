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

goog.provide('app.ImageItemOrnamentSkinny1');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Skinny ornament 1 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentSkinny1 = function() {
  app.SVGImage.call(this);

  this.width = 23.4;
  this.height = 63.1;
};
app.ImageItemOrnamentSkinny1.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentSkinny1.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.43 63.08" width="23.43" height="63.08"><defs><style>.cls-1{fill:' + color + ';}.cls-2{fill:#231f20;opacity:0.06;}.cls-3{fill:#607d8b;}.cls-4{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M17.74,16.21a6,6,0,0,0-2.3-1.76V8.66H8v5.79a6,6,0,0,0-2.3,1.76C-8.31,35.4,7.5,58.11,11,62.75a.86.86,0,0,0,1.35,0C15.93,58.11,31.74,35.4,17.74,16.21Z"/><path class="cls-2" d="M17.74,16.21a6,6,0,0,0-2.3-1.76V8.66H12.06v5.79c10.62,21.67,2.67,34.7-2,46.91.4.57.75,1,1,1.39a.86.86,0,0,0,1.35,0C15.93,58.11,31.74,35.4,17.74,16.21Z"/><path class="cls-3" d="M7.5,7.31a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.08l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0l1.32,1.32a.11.11,0,0,0,.15,0l1.32-1.32a.1.1,0,0,1,.14,0L16,13a.1.1,0,0,0,.17-.08V7.41a.1.1,0,0,0-.1-.1Z"/><circle class="cls-4" cx="11.78" cy="3.98" r="3.47"/></svg>';
  return data;
};
