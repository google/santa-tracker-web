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

goog.provide('app.ImageItemCandySprinkleTree');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy tree sprinkle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandySprinkleTree = function() {
  app.SVGImage.call(this);

  this.width = 17;
  this.height = 21;
};
app.ImageItemCandySprinkleTree.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySprinkleTree.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.52 10.45" width="8.52" height="10.45"><defs><style>.cls-1{fill:' + color + ';}</style></defs><path class="cls-1" d="M8.5,9.18l-2-2.77h1.2a.12.12,0,0,0,.09-.19l-2-2.7h.65a.12.12,0,0,0,.11-.18L4.36.06a.11.11,0,0,0-.2,0L2,3.34a.11.11,0,0,0,.1.18h.65l-2,2.7a.12.12,0,0,0,.1.19H2.1L0,9.18a.11.11,0,0,0,.09.19H3.5v1a.12.12,0,0,0,.12.12H4.9A.12.12,0,0,0,5,10.33v-1H8.4A.12.12,0,0,0,8.5,9.18Z"/></svg>';
  return data;
};
