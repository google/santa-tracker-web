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

goog.provide('app.ImageItemCandySprinkleLeaf');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy leaf sprinkle image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandySprinkleLeaf = function() {
  app.SVGImage.call(this);

  this.width = 15.6;
  this.height = 10.7;
};
app.ImageItemCandySprinkleLeaf.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandySprinkleLeaf.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.59 10.74" width="15.59" height="10.74"><defs><style>.cls-1{fill:' + color + ';}</style></defs><path class="cls-1" d="M15.56,9a.35.35,0,0,0-.16-.2h0c-2-1.37-1.38-2.66-1.15-3.15a.33.33,0,0,0,0-.32A.33.33,0,0,0,14,5.17,3.49,3.49,0,0,1,11.17,4.1a1.31,1.31,0,0,1,0-1.34.32.32,0,0,0-.08-.38.33.33,0,0,0-.38-.06,3.74,3.74,0,0,1-3.37-.23,1.92,1.92,0,0,1-1-1.74.31.31,0,0,0-.16-.3.32.32,0,0,0-.34,0A7,7,0,0,1,1,1.2a.34.34,0,0,0-.34.19L0,2.77a.32.32,0,0,0,.08.38A7.07,7.07,0,0,1,2.29,7.62a.35.35,0,0,0,.16.25l0,0a.33.33,0,0,0,.34-.07h0a1.92,1.92,0,0,1,2-.35A3.73,3.73,0,0,1,7.12,9.93a.33.33,0,0,0,.29.26A.32.32,0,0,0,7.75,10a1.29,1.29,0,0,1,1-.86,3.45,3.45,0,0,1,2.59,1.47.3.3,0,0,0,.3.11.31.31,0,0,0,.25-.18c.23-.48.83-1.76,3.15-1.09h0a.36.36,0,0,0,.27,0,.43.43,0,0,0,.21-.19A.36.36,0,0,0,15.56,9Z"/></svg>';
  return data;
};
