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

goog.provide('app.ImageItemOrnamentWide3');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Wide ornament 3 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentWide3 = function() {
  app.SVGImage.call(this);

  this.width = 51;
  this.height = 49;
};
app.ImageItemOrnamentWide3.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentWide3.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.25 49.14" width="51.25" height="49.14"><defs><style>.cls-1{fill:' + colors.primary + ';}.cls-2{fill:' + colors.medium + ';}.cls-3{opacity:0.1;}.cls-4{fill:#607d8b;}.cls-5{fill:none;stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style></defs><path class="cls-1" d="M51.19,29.16C51,26.84,49.4,22,39,18.9c-10.16-3-10.8-6-10.8-6H23s-.65,3-10.81,6C1.47,22.06.07,27.16,0,29.38H0s0,2.12,0,2.27C.21,34,2.08,39.51,14.82,43c6.7,1.84,9.24,4.24,10.2,5.79a.69.69,0,0,0,1.17,0c.95-1.55,3.49-3.94,10.19-5.79C49.32,39.45,51,33.87,51.17,31.55h0A12.64,12.64,0,0,0,51.19,29.16Z"/><path class="cls-2" d="M51.11,28.53a5.45,5.45,0,0,0-.22-1L46,30.13,36.82,25.4l8-4.15c-.33-.18-.67-.36-1-.54l-8,4.16-9.12-4.73,6.5-3.37c-.38-.18-.74-.35-1.06-.52L25.62,19.6l-6.49-3.36-1.06.52,6.52,3.38-9.13,4.73-8-4.17c-.37.18-.71.36-1,.54l8,4.16L5.3,30.13l-5-2.57a6.3,6.3,0,0,0-.24,1l4.17,2.16-4,2.09a8.16,8.16,0,0,0,.3.92L5.3,31.21l9.12,4.72-7.63,4,1,.54,7.64-4,9.13,4.73-6,3.09,1.14.48,5.86-3,5.85,3,1.14-.48L26.66,41.2l9.12-4.73,7.63,4,1-.54-7.62-4L46,31.21l4.74,2.45a8.16,8.16,0,0,0,.3-.92l-4-2.07ZM25.62,20.68l9.13,4.72-9.13,4.73L16.5,25.4Zm-19.28,10,9.12-4.73,9.13,4.73-9.13,4.72Zm19.28,10L16.5,35.93l9.12-4.72,9.13,4.72Zm10.16-5.27-9.12-4.72,9.12-4.73,9.13,4.73Z"/><path class="cls-3" d="M51.19,29.16C51,26.84,49.4,22,39,18.9c-10.16-3-10.8-6-10.8-6h-4.8s32,18.2-.19,33.91a8.31,8.31,0,0,1,1.89,2,.59.59,0,0,0,1,0C27,47.35,29.46,44.93,36.38,43,49.32,39.45,51,33.87,51.17,31.55h0A12.64,12.64,0,0,0,51.19,29.16Z"/><path class="cls-4" d="M21.34,8.73a.09.09,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.07l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0L27,14.5a.11.11,0,0,0,.15,0l1.32-1.32a.1.1,0,0,1,.14,0l1.22,1.22a.1.1,0,0,0,.17-.07V8.83a.1.1,0,0,0-.1-.1Z"/><path class="cls-5" d="M25.88,12.25V2.45A1.92,1.92,0,0,0,24,.52h0A1.93,1.93,0,0,0,22,2.45V5.24"/></svg>';
  return data;
};
