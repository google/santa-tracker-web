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

goog.provide('app.StampBauble');
goog.require('app.Constants');
goog.require('app.Stamp');


/**
 * Bow Stamp tool
 * @constructor
 * @extends {app.Stamp}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the stamp
 */
app.StampBauble = function($elem, name) {
  app.Stamp.call(this, $elem, name);

  this.width = 50.5;
  this.height = 81.5;
};
app.StampBauble.prototype = Object.create(app.Stamp.prototype);


app.StampBauble.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50.51 81.45"><defs><style>.cls-1{isolation:isolate;}.cls-2{fill:none;stroke:#eee;stroke-miterlimit:10;}.cls-3{fill:#bdbdbd;}.cls-4{fill:#eee;}.cls-5{fill:' + colors.primary + ';}.cls-6{opacity:0.15;mix-blend-mode:multiply;}.cls-7{fill:#231f20;}.cls-8,.cls-9{fill:#fff;}.cls-9{opacity:0.3;}</style></defs><g class="cls-1"><path class="cls-2" d="M23.46,33.85s8.19-31.61,1-33.2-4.17,10-4.17,10"/><rect class="cls-3" x="18.31" y="23.44" width="13.39" height="13.39" transform="translate(-0.12 0.1) rotate(-0.22)"/><rect class="cls-4" x="18.31" y="23.45" width="5.27" height="13.39" transform="translate(-0.12 0.08) rotate(-0.22)"/><circle class="cls-5" cx="25.11" cy="56.35" r="25.11"/><g class="cls-6"><path class="cls-7" d="M25,31.26a27.63,27.63,0,0,1,.19,50.19A25.1,25.1,0,1,0,25,31.26Z"/></g><circle class="cls-8" cx="13.95" cy="43.42" r="4.47"/><circle class="cls-9" cx="7.66" cy="53.2" r="2.51"/></g></svg>';
  return data;
};
