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

goog.provide('app.StampPresent');
goog.require('app.Constants');
goog.require('app.Stamp');


/**
 * Bow Stamp tool
 * @constructor
 * @extends {app.Stamp}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the stamp
 */
app.StampPresent = function($elem, name) {
  app.Stamp.call(this, $elem, name);

  this.width = 118;
  this.height = 143.5;
};
app.StampPresent.prototype = Object.create(app.Stamp.prototype);


app.StampPresent.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118 143.48"><defs><style>.cls-1{isolation:isolate;}.cls-2{fill:#f2faff;}.cls-3{fill:' + colors.primary + ';}.cls-4{fill:#221f1f;opacity:0.15;mix-blend-mode:multiply;}.cls-5{fill:' + colors.medium + ';}.cls-6{fill:' + colors.highlight + ';}</style></defs><title>present_primary</title><g class="cls-1"><g id="Layer_2" data-name="Layer 2"><g id="ART"><rect class="cls-2" x="2.19" y="45.55" width="113.84" height="97.93"/><rect class="cls-3" x="2" y="82.28" width="114" height="24.48"/><rect class="cls-2" y="40.33" width="118" height="22"/><polygon class="cls-4" points="2 110.43 2 106.76 115.84 106.76 116 108.59 2 110.43"/><rect class="cls-3" x="47.5" y="37.83" width="22" height="27" transform="translate(7.17 109.83) rotate(-90)"/><path class="cls-3" d="M18.93,29.2s-2.46,7-1.59,11.13H42.58S18.93,38.94,18.93,29.2Z"/><path d="M42.58,40.33S18.93,38.94,18.93,29.2C18.93,29.2,26.41,23.64,42.58,40.33Z"/><path class="cls-3" d="M98.72,27.88s1.75,8.28.88,12.45H73.21S98.72,37.62,98.72,27.88Z"/><path d="M73.21,40.33s25.51-2.71,25.51-12.45C98.72,27.88,89.38,23.64,73.21,40.33Z"/><path class="cls-3" d="M59.87,40.33s-2-34.65,6.35-38.25L89,7.16s3.33,3.71,1.2,11.58c-2.83,10.46-17,21.59-17,21.59Z"/><path class="cls-5" d="M66.22,2.08s5.08,5.15,1,14.19c-1.5,3.3-2.92,6.71-4,10,18.33-3.44,27.58-14.47,27.6-14.49A9.16,9.16,0,0,0,89,7.16Z"/><path d="M66.22,2.08c-8.4,3.6-6.35,38.25-6.35,38.25h1.76c-2.05-5.17,1.48-15,5.58-24.06s-1-14.19-1-14.19Z"/><path d="M56.45,9.56C56.45-.18,50.92,0,50.92,0,44,12.52,62,40.33,62,40.33,55.09,25,56.45,19.29,56.45,9.56Z"/><path class="cls-3" d="M49.58,10.53h0l-25,2.84A19.26,19.26,0,0,0,26,19.31,106.51,106.51,0,0,0,61.35,39.63l.28.7H62S51.33,23.83,49.58,10.53Z"/><path class="cls-6" d="M49.58,10.53c-.52-4-.26-7.65,1.34-10.53,0,0-15.3,5.56-20.86,7s-5.56,5.57-5.56,5.57c0,.28,0,.57.05.86l25-2.84Z"/><path class="cls-5" d="M26,19.31c4.33,10.65,16.58,21,16.58,21H62l-.46-.73A108.11,108.11,0,0,1,26,19.31Z"/><rect class="cls-3" x="17.92" y="90.66" width="81.15" height="24.48" transform="translate(-44.41 161.4) rotate(-90)"/><polygon class="cls-4" points="2 66 2 62.33 115.84 62.33 116 64.17 2 66"/></g></g></g></svg>';
  return data;
};
