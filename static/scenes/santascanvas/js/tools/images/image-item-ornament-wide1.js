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

goog.provide('app.ImageItemOrnamentWide1');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Wide ornament 1 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentWide1 = function() {
  app.SVGImage.call(this);

  this.width = 51.25;
  this.height = 49.1;
};
app.ImageItemOrnamentWide1.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentWide1.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.25 49.14" width="51.25" height="49.14"><defs><style>.cls-1{fill:' + color + ';}.cls-2{opacity:0.1;}.cls-3{fill:#607d8b;}.cls-4{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M51.19,29.16C51,26.84,49.4,22,39,18.9c-10.16-3-10.8-6-10.8-6H23s-.65,3-10.81,6C1.47,22.06.07,27.16,0,29.38H0s0,2.12,0,2.27C.21,34,2.08,39.51,14.82,43c6.7,1.84,9.24,4.24,10.2,5.79a.69.69,0,0,0,1.17,0c.95-1.55,3.49-3.94,10.19-5.79C49.32,39.45,51,33.87,51.17,31.55h0A12.64,12.64,0,0,0,51.19,29.16Z"/><path class="cls-2" d="M51.19,29.16C51,26.84,49.4,22,39,18.9c-10.16-3-10.8-6-10.8-6h-4.8s32,18.2-.19,33.91a8.31,8.31,0,0,1,1.89,2,.59.59,0,0,0,1,0C27,47.35,29.46,44.93,36.38,43,49.32,39.45,51,33.87,51.17,31.55h0A12.64,12.64,0,0,0,51.19,29.16Z"/><path class="cls-3" d="M21.34,8.73a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0L27,14.5a.11.11,0,0,0,.15,0l1.32-1.32a.1.1,0,0,1,.14,0l1.22,1.22a.1.1,0,0,0,.17-.07V8.83a.1.1,0,0,0-.1-.1Z"/><path class="cls-4" d="M25.88,12.25V2.45A1.92,1.92,0,0,0,24,.52h0A1.93,1.93,0,0,0,22,2.45V5.24"/></svg>';
  return data;
};
