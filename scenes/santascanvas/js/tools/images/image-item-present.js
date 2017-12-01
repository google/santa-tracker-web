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

goog.provide('app.ImageItemPresent');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Present image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemPresent = function() {
  app.SVGImage.call(this);

  this.width = 86;
  this.height = 104.6;
};
app.ImageItemPresent.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemPresent.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var complementColors = app.Constants.SVG_COLOR_MATRIX[colors.complement];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86.02 104.6" width="86.02" height="104.6"><defs><style>.cls-1{isolation:isolate;}.cls-2{fill:' + colors.primary + ';}.cls-3{fill:' + complementColors.primary + ';}.cls-4{fill:#221f1f;opacity:0.15;mix-blend-mode:multiply;}.cls-5{fill:' + complementColors.dark + ';}.cls-6{fill:' + complementColors.medium + ';}.cls-7{fill:' + complementColors.highlight + ';}</style></defs><g class="cls-1"><rect class="cls-2" x="1.6" y="33.21" width="82.99" height="71.39"/><rect class="cls-3" x="1.46" y="59.98" width="83.11" height="17.85"/><rect class="cls-2" y="29.4" width="86.02" height="16.04"/><polygon class="cls-4" points="1.46 80.5 1.46 77.83 84.45 77.83 84.56 79.17 1.46 80.5"/><rect class="cls-3" x="34.63" y="27.58" width="16.04" height="19.68" transform="translate(5.23 80.07) rotate(-90)"/><path class="cls-3" d="M13.8,21.29S12,26.36,12.64,29.4H31S13.8,28.39,13.8,21.29Z"/><path class="cls-5" d="M31,29.4s-17.24-1-17.24-8.11C13.8,21.29,19.25,17.23,31,29.4Z"/><path class="cls-3" d="M72,20.33s1.27,6,.64,9.07H53.37S72,27.42,72,20.33Z"/><path class="cls-5" d="M53.37,29.4s18.6-2,18.6-9.07C72,20.33,65.16,17.23,53.37,29.4Z"/><path class="cls-6" d="M43.64,29.4S42.15,4.14,48.27,1.52L64.9,5.22s2.43,2.7.87,8.44c-2.06,7.63-12.4,15.74-12.4,15.74Z"/><path class="cls-3" d="M48.27,1.52S52,5.27,49,11.86c-1.09,2.41-2.12,4.89-2.92,7.26C59.42,16.61,66.17,8.57,66.19,8.56A6.7,6.7,0,0,0,64.9,5.22Z"/><path class="cls-5" d="M48.27,1.52C42.15,4.14,43.64,29.4,43.64,29.4h1.29C43.43,25.63,46,18.45,49,11.86s-.72-10.34-.72-10.34Z"/><path class="cls-5" d="M41.16,7c0-7.1-4-7-4-7-5.07,9.12,8.11,29.4,8.11,29.4C40.16,18.25,41.16,14.06,41.16,7Z"/><path class="cls-3" d="M36.14,7.67v0L17.9,9.75A13.9,13.9,0,0,0,19,14.08,77.71,77.71,0,0,0,44.72,28.89l.21.51h.3S37.42,17.37,36.14,7.67Z"/><path class="cls-7" d="M36.14,7.67a12.51,12.51,0,0,1,1-7.67S26,4.06,21.91,5.07s-4.05,4-4.05,4c0,.21,0,.42,0,.63L36.14,7.69Z"/><path class="cls-6" d="M19,14.08C22.11,21.84,31,29.4,31,29.4H45.23l-.34-.53A78.9,78.9,0,0,1,19,14.08Z"/><rect class="cls-3" x="13.07" y="66.09" width="59.16" height="17.85" transform="translate(-32.37 117.66) rotate(-90)"/><polygon class="cls-4" points="1.46 48.12 1.46 45.44 84.45 45.44 84.56 46.78 1.46 48.12"/></g></svg>';
  return data;
};
