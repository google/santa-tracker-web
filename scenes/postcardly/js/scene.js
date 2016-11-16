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
goog.require('app.Controls');
goog.require('app.Picker');
goog.require('app.Slider');
goog.require('app.shared.Tutorial');
goog.require('app.shared.ShareOverlay');

/**
 * Main scene class.
 * @param {!Element} elem The scene element.
 * @constructor
 * @export
 */
app.Scene = function(elem) {
  this.elem = $(elem);

  this.bgsTrackElem = this.elem.find('.bgs-left, .bgs-right');
  this.background = new app.Slider(this.elem.find('.message .bgs'), {
    max: app.Constants.BACKGROUND_COUNT,
    size: app.Constants.SCREEN_WIDTH,
    horizontal: true,
    changed: this.bgsChanged_.bind(this)
  });
  // Dummy slider, needed by app.Controls.
  this.foreground = new app.Slider(this.elem.find('.message .fgs'), {
    changed: function() {}
  });

  // Dummy tutorial, needed by app.Controls.
  this.tutorial = new app.shared.Tutorial(this.elem, 'touch-leftright',
      'keys-leftright', 'spacenav-leftright');
  this.tutorial.off('keys-leftright');
  this.picker = new app.Picker(this);
  this.controls = new app.Controls(this);
  this.drawSnowflakes();
  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));
  this.elem.find('#share-button').on('click.postcardly touchend.postcardly', this.showShareOverlay.bind(this));
};

/**
 * Is notified when background changes.
 * @private
 * @param {number} selected The number of the selected background.
 * @param {number} pos The position of the selected background.
 *                     Multiply with width to get position.
 */
app.Scene.prototype.bgsChanged_ = function(selected, pos) {
  this.bgsTrackElem.each(function() {
    var position = (app.Constants.SMALL_SCREEN_WIDTH * (pos + 1) * -1) +
        ($(this).data('offset') || 0);
    $(this).css('background-position', position + 'px 0');
  });
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

  const pos = Math.round(Math.random() * 100);
  const rotate = Math.round(Math.random() * app.Constants.SNOWFLAKE_ROTATION) - (app.Constants.SNOWFLAKE_ROTATION / 2);
  const fallSpeed = randomRange(app.Constants.SNOWFLAKE_SPEED_MIN, app.Constants.SNOWFLAKE_SPEED_MAX);
  const shimmySpeed = randomRange(app.Constants.SNOWFLAKE_SHIMMY_MIN, app.Constants.SNOWFLAKE_SHIMMY_MAX);
  const size = Math.round(randomRange(app.Constants.SNOWFLAKE_SIZE_MIN, app.Constants.SNOWFLAKE_SIZE_MAX));

  elem.style.transform = 'rotate(' + rotate + 'deg)';
  elem.style.left = pos + '%';

  var shimmy = elem.querySelector('.shimmy');
  shimmy.style.animationDuration = shimmySpeed + 's';
  shimmy.style.fontSize = fallSpeed + 'px';  // shimmy width is inverse to speed

  var fall = elem.querySelector('.fall');
  fall.style.animationDuration = fallSpeed + 's';
  fall.style.animationDelay = (+delay) + 's';

  var snow = elem.querySelector('.snow');
  snow.style.width = size + 'px';
  return elem;
};

app.Scene.prototype.drawSnowflakes = function() {
  for (var i = 0, count = app.Constants.SNOWFLAKE_COUNT; i < count; ++i) {
    // Delay snowflakes by their count sec.
    var x = this.snowflakeFactory(null, i);
    this.elem.find('#postcard .frame-inner')[0].appendChild(x);
  }
};

//TODO(madCode): fix duplication.
/**
 * Returns a random number in the range [min,max).
 * @param {number} min
 * @param {number=} opt_max
 * @return {number}
 */
function randomRange(min, opt_max) {
  var max = opt_max || 0;
  return min + Math.random() * (max - min);
};

app.Scene.prototype.showShareOverlay = function() {
  var bgNum = this.background.getPosition(0);
  var fgNum = this.foreground.getPosition(0);
  var blocks = this.blocks;
  var params = '?bg=' + bgNum + '&fg=' + fgNum + '&B=' + blocks;
  var url;
  if (window.location.hostname.includes('localhost')) {
    url = window.location.href;
    var chop = url.indexOf('?');
    if (chop != -1) {
      url = url.substring(0,chop);
    }
    url += params;
  } else {
    url = 'https://' + window.location.hostname + '/#postcardly' + params;
  }
  this.shareOverlay.show(url, true);
};
