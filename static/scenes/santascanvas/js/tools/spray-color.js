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

goog.provide('app.SprayColor');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Spray can that sprays sprinkles
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {!string} name The name of the tool.
 */
app.SprayColor = function($elem, name) {
  app.TextureDrawer.call(this, $elem, name);
};
app.SprayColor.prototype = Object.create(app.TextureDrawer.prototype);


app.SprayColor.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.SPRAY_MIN,
      app.Constants.SPRAY_MAX);
};
