/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.Lights');

/**
 * Lighting interactions
 *
 * @param {!Element} elem A DOM element which wraps the game.
 * @constructor
 */
app.Lights = function(elem) {
  var lights = elem.find('.Lights');
  this.floorLights = lights.find('.Light-floor');
  this.ceilingLights = lights.find('.Light-ceiling');

  var triggerLights = function(condition, light, className) {
    condition ? light.addClass(className) : light.removeClass(className);
  };

  elem.on('stagechanged.jamband', function(e, data) {
    var count = data.count;
    triggerLights(count > 0, this.ceilingLights, 'Light-ceiling--on');
    triggerLights(count > 2, this.floorLights, 'Light-floor--on');
    triggerLights(count > 3, this.floorLights, 'animate');
    triggerLights(count > 4, this.floorLights, 'Light-colored--on');
    triggerLights(count > 5, this.ceilingLights, 'Light-colored--on');
  }.bind(this));
};
