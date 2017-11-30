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

  this.width = 117.2;
  this.height = 28;
};
app.ImageItemCandyWrapper2.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyWrapper2.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58.61 13.95" width="58.61" height="13.95"><defs><style>.cls-1{fill:#f2f2f2;}.cls-2{fill:' + colors.primary + ';}.cls-3{fill:' + colors.dark + ';}.cls-4{fill:' + colors.medium + ';}.cls-5{opacity:0.1;}</style></defs><rect class="cls-1" x="10.93" y="1.72" width="36.75" height="11.78" rx="2.84" ry="2.84"/><path class="cls-2" d="M16.83,1.72h-3a2.82,2.82,0,0,0-1.33.34l5.33,11.43h4.55Z"/><path class="cls-2" d="M14.74,13.49,10.93,5.33v5.32a2.84,2.84,0,0,0,2.85,2.84Z"/><polygon class="cls-2" points="24.69 1.72 20.15 1.72 25.64 13.49 30.19 13.49 24.69 1.72"/><polygon class="cls-2" points="32.55 1.72 28.01 1.72 33.5 13.49 38.05 13.49 32.55 1.72"/><path class="cls-2" d="M45.82,13.31,40.41,1.72H35.87l5.49,11.77h3.47A3,3,0,0,0,45.82,13.31Z"/><path class="cls-2" d="M44.83,1.72h-1.1l4,8.47V4.56A2.84,2.84,0,0,0,44.83,1.72Z"/><path class="cls-3" d="M47.68,8.41a19.3,19.3,0,0,0,3.81,3.52,9.07,9.07,0,0,0,4.49,2,2.61,2.61,0,0,0,2.19-.7,1.14,1.14,0,0,0,.3-.89,1.64,1.64,0,0,0-.37-.67,7,7,0,0,0-.88-.84c-.36-.28-.78-.58-.83-1a1.22,1.22,0,0,1,.59-1C57.32,8.55,58.61,8,58.61,7S57.32,5.4,57,5.16a1.2,1.2,0,0,1-.59-1c0-.46.47-.76.83-1a6.35,6.35,0,0,0,.88-.84,1.64,1.64,0,0,0,.37-.67,1.11,1.11,0,0,0-.3-.88A2.59,2.59,0,0,0,56,0a9.16,9.16,0,0,0-4.49,2,19.92,19.92,0,0,0-3.81,3.52Z"/><path class="cls-3" d="M10.93,8.41a19.3,19.3,0,0,1-3.81,3.52,9.07,9.07,0,0,1-4.49,2,2.61,2.61,0,0,1-2.19-.7,1.14,1.14,0,0,1-.3-.89,1.64,1.64,0,0,1,.37-.67,7,7,0,0,1,.88-.84c.36-.28.78-.58.83-1a1.22,1.22,0,0,0-.59-1C1.29,8.55,0,8,0,7S1.29,5.4,1.63,5.16a1.2,1.2,0,0,0,.59-1c-.05-.46-.47-.76-.83-1a6.35,6.35,0,0,1-.88-.84A1.64,1.64,0,0,1,.14,1.6,1.11,1.11,0,0,1,.44.72,2.59,2.59,0,0,1,2.63,0,9.16,9.16,0,0,1,7.12,2a19.92,19.92,0,0,1,3.81,3.52Z"/><path class="cls-4" d="M50,6.06a.27.27,0,0,1-.26-.18.27.27,0,0,1,.16-.35A42.36,42.36,0,0,1,55.27,4a.28.28,0,0,1,.12.54,40.18,40.18,0,0,0-5.34,1.55Z"/><path class="cls-4" d="M55.33,10h-.06a42.36,42.36,0,0,1-5.41-1.57.27.27,0,0,1-.16-.35.27.27,0,0,1,.35-.16,42.43,42.43,0,0,0,5.34,1.55.27.27,0,0,1,.21.32A.28.28,0,0,1,55.33,10Z"/><path class="cls-4" d="M8.65,6.06H8.56A40.18,40.18,0,0,0,3.22,4.5.28.28,0,0,1,3,4.17.27.27,0,0,1,3.34,4,42.36,42.36,0,0,1,8.75,5.53a.27.27,0,0,1,.16.35A.27.27,0,0,1,8.65,6.06Z"/><path class="cls-4" d="M3.28,10A.28.28,0,0,1,3,9.78a.27.27,0,0,1,.21-.32A42.43,42.43,0,0,0,8.56,7.91a.27.27,0,0,1,.35.16.27.27,0,0,1-.16.35A42.36,42.36,0,0,1,3.34,10Z"/><g class="cls-5"><path d="M44.83,10.12h-31a2.85,2.85,0,0,1-2.85-2.85v3.38a2.84,2.84,0,0,0,2.85,2.84H44.83a2.84,2.84,0,0,0,2.85-2.84V7.27A2.85,2.85,0,0,1,44.83,10.12Z"/></g></svg>';
  return data;
};
