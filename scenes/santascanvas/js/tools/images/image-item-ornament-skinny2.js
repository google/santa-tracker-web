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

goog.provide('app.ImageItemOrnamentSkinny2');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Skinny ornament 2 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentSkinny2 = function() {
  app.SVGImage.call(this);

  this.width = 25.2;
  this.height = 63.1;
};
app.ImageItemOrnamentSkinny2.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentSkinny2.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 25.2 63.1" width="25.2" height="63.1" style="enable-background:new 0 0 25.2 63.1;" xml:space="preserve"><style type="text/css">.st0{fill:' + color + ';}.st1{fill:#FFFFFF;}.st2{opacity:.06;fill:#231F20;enable-background:new;}.st3{fill:#607D8B;}</style><path class="st0" d="M18.6,16.2c-0.6-0.8-1.4-1.4-2.3-1.8V8.7H8.8v5.8c-0.9,0.4-1.7,1-2.3,1.8c-14,19.2,1.8,41.9,5.4,46.5 c0.3,0.4,0.8,0.4,1.2,0.1c0.1,0,0.1-0.1,0.1-0.1C16.8,58.1,32.6,35.4,18.6,16.2z"/><g><path class="st1" d="M0.9,35.3c0,0.4,0,0.8,0.1,1.2l3.1,2l4.4-2.7L4,33.2L0.9,35.3z"/><polygon class="st1" points="8.4,35.9 12.5,38.5 16.8,35.9 12.5,33.2 "/><path class="st1" d="M20.9,33.2l-4,2.6l4,2.7l3.3-2c0-0.4,0.1-0.8,0.1-1.3L20.9,33.2z"/></g><path class="st2" d="M18.6,16.2c-0.6-0.8-1.4-1.4-2.3-1.8V8.7h-3.4v5.8c10.6,21.7,2.7,34.7-2,46.9c0.4,0.6,0.7,1,1,1.4 c0.3,0.4,0.8,0.4,1.2,0.1c0.1,0,0.1-0.1,0.1-0.1C16.8,58.1,32.6,35.4,18.6,16.2z"/><path class="st3" d="M16.9,7.3C16.9,7.3,16.9,7.3,16.9,7.3h-2.1c1.1-0.7,1.8-1.9,1.8-3.3c0-2.2-1.8-4-4-4c-2.2,0-4,1.8-4,4 c0,1.4,0.7,2.6,1.8,3.3H8.3c-0.1,0-0.1,0-0.1,0.1v5.5c0,0.1,0,0.1,0.1,0.1c0,0,0.1,0,0.1,0l1.2-1.2c0,0,0.1,0,0.1,0l1.3,1.3 c0,0,0.1,0,0.1,0l1.3-1.3c0,0,0.1,0,0.1,0l1.3,1.3c0,0,0.1,0,0.1,0l1.3-1.3c0,0,0.1,0,0.1,0l1.2,1.2c0,0,0.1,0,0.1,0c0,0,0,0,0-0.1  V7.4C17,7.4,17,7.3,16.9,7.3z M9.7,4c0-1.6,1.3-3,3-3s3,1.3,3,3s-1.3,3-3,3S9.7,5.6,9.7,4z"/></svg>';
  return data;
};
