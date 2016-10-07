/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.shared.Tutorial');

/**
 * Main scene class.
 * @param {!Element} elem The scene element.
 * @constructor
 * @export
 */
app.Scene = function(elem) {
  this.elem = $(elem);
  this.drawSnowflakes();
};

/**
 * Clean up when scene is closed.
 * @export
 */
app.Scene.prototype.dispose = function() {
};

/**
 * Builds and returns a random snowflake. If a previous snowflake was passed,
 * just update it instead of rebuilding it.
 */
app.Scene.prototype.snowflakeFactory = function(elem, delay) {
  if (!elem) {
    // Three transforms are applied, so three elements are needed-
    //   1. outermost positions l/r on page, and rotates for a directed fall
    //   2. .shimmy shakes snowflake left and right
    //   3. .fall.snow draws the snowflake and transforms it down
    elem = document.createElement('span');
    elem.innerHTML = '<span class="shimmy"><span class="fall snow"></span></span>';
  }

  var pos = Math.round(Math.random() * 100);
  var rotate = Math.round(Math.random() * app.Constants.SNOWFLAKE_ROTATION) - (app.Constants.SNOWFLAKE_ROTATION / 2);
  var fallSpeed = randomRange(app.Constants.SNOWFLAKE_SPEED_MIN, app.Constants.SNOWFLAKE_SPEED_MAX);
  var shimmySpeed = randomRange(app.Constants.SNOWFLAKE_SHIMMY_MIN, app.Constants.SNOWFLAKE_SHIMMY_MAX);
  var size = Math.round(randomRange(app.Constants.SNOWFLAKE_SIZE_MIN, app.Constants.SNOWFLAKE_SIZE_MAX));

  elem.style.transform = 'rotate(' + rotate + 'deg)';
  elem.style.left = pos + '%';

  var shimmy = elem.querySelector('.shimmy');
  webkitStyle(shimmy, 'animationDuration', shimmySpeed + 's');
  shimmy.style.fontSize = fallSpeed + 'px';  // shimmy width is inverse to speed

  var fall = elem.querySelector('.fall');
  webkitStyle(fall, 'animationDuration', fallSpeed + 's');
  webkitStyle(fall, 'animationDelay', (+delay) + 's');

  var snow = elem.querySelector('.snow');
  snow.style.width = size + 'px';
  return elem;
}

app.Scene.prototype.drawSnowflakes = function() {
  var ratio = 1;
  for (var i = 0, count = Math.floor(ratio * app.Constants.SNOWFLAKE_COUNT); i < count; ++i) {
    // Delay snowflakes by their count+5 sec.
    var x = this.snowflakeFactory(null, i + 5);
    document.getElementById('snowglobe').appendChild(x);
  }
}
