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

goog.provide('app.ImageItemCandyWrapper2');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy Wrapper 2 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyWrapper2 = function() {
  app.SVGImage.call(this);

  this.width = 58.6;
  this.height = 24.2;
};
app.ImageItemCandyWrapper2.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyWrapper2.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 58.61 24.22"><defs><style>.cls-1,.cls-4,.cls-6{fill:none;}.cls-2{fill:#f2f2f2;}.cls-3{clip-path:url(#clip-path);}.cls-4{stroke:' + colors.primary + ';stroke-width:4.12px;}.cls-4,.cls-6{stroke-miterlimit:10;}.cls-5{fill:' + colors.dark + ';}.cls-6{stroke:' + colors.medium + ';stroke-linecap:round;stroke-width:0.55px;}.cls-7{opacity:0.1;}</style><clipPath id="clip-path"><rect class="cls-1" x="10.93" y="6.25" width="36.75" height="11.78" rx="2.84" ry="2.84"/></clipPath></defs><rect class="cls-2" x="10.93" y="6.25" width="36.75" height="11.78" rx="2.84" ry="2.84"/><g class="cls-3"><line class="cls-4" x1="12.05" y1="0.87" x2="22.54" y2="23.35"/><line class="cls-4" x1="4.46" y1="0.87" x2="14.95" y2="23.35"/><line class="cls-4" x1="19.91" y1="0.87" x2="30.4" y2="23.35"/><line class="cls-4" x1="27.77" y1="0.87" x2="38.26" y2="23.35"/><line class="cls-4" x1="35.63" y1="0.87" x2="46.12" y2="23.35"/><line class="cls-4" x1="43.49" y1="0.87" x2="53.98" y2="23.35"/></g><path class="cls-5" d="M47.68,13a19.55,19.55,0,0,0,3.81,3.51,9.08,9.08,0,0,0,4.49,2,2.59,2.59,0,0,0,2.19-.71,1.11,1.11,0,0,0,.3-.88,1.58,1.58,0,0,0-.37-.67,6.35,6.35,0,0,0-.88-.84c-.36-.29-.78-.59-.83-1a1.22,1.22,0,0,1,.59-1c.34-.24,1.63-.79,1.63-1.81S57.32,9.94,57,9.7a1.22,1.22,0,0,1-.59-1c0-.45.47-.75.83-1a6.42,6.42,0,0,0,.88-.85,1.52,1.52,0,0,0,.37-.67,1.12,1.12,0,0,0-.3-.88A2.61,2.61,0,0,0,56,4.55a9.07,9.07,0,0,0-4.49,2,19.55,19.55,0,0,0-3.81,3.51Z"/><path class="cls-5" d="M10.93,13a19.55,19.55,0,0,1-3.81,3.51,9.08,9.08,0,0,1-4.49,2,2.59,2.59,0,0,1-2.19-.71,1.11,1.11,0,0,1-.3-.88,1.58,1.58,0,0,1,.37-.67,6.35,6.35,0,0,1,.88-.84c.36-.29.78-.59.83-1a1.22,1.22,0,0,0-.59-1C1.29,13.08,0,12.53,0,11.51S1.29,9.94,1.63,9.7a1.22,1.22,0,0,0,.59-1c-.05-.45-.47-.75-.83-1A6.42,6.42,0,0,1,.51,6.8a1.52,1.52,0,0,1-.37-.67,1.12,1.12,0,0,1,.3-.88,2.61,2.61,0,0,1,2.19-.7,9.07,9.07,0,0,1,4.49,2,19.55,19.55,0,0,1,3.81,3.51Z"/><path class="cls-6" d="M50,10.32a43.4,43.4,0,0,1,5.37-1.56"/><path class="cls-6" d="M50,12.7a41.74,41.74,0,0,0,5.37,1.56"/><path class="cls-6" d="M8.65,10.32A43.4,43.4,0,0,0,3.28,8.76"/><path class="cls-6" d="M8.65,12.7a41.74,41.74,0,0,1-5.37,1.56"/><path class="cls-7" d="M44.83,14.65h-31a2.84,2.84,0,0,1-2.85-2.84v3.37A2.85,2.85,0,0,0,13.78,18H44.83a2.85,2.85,0,0,0,2.85-2.85V11.81A2.84,2.84,0,0,1,44.83,14.65Z"/></svg>';
  return data;
};
