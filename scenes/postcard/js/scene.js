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

goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.Picker');
goog.require('app.Slider');
goog.require('app.shared.ShareOverlay');
goog.require('app.shared.Tutorial');

/**
 * Main scene class.
 * @param {!Element} elem The scene element.
 * @constructor
 * @export
 */
app.Scene = function(elem) {
  this.elem = $(elem);

  // DOM elements
  this.fgsLogoElem = this.elem.find('.picker .fgs .logo');
  this.bgsLogoElem = this.elem.find('.picker .bgs .logo');
  this.fgsTrackElem = this.elem.find('.fgs-up, .fgs-down');
  this.bgsTrackElem = this.elem.find('.bgs-left, .bgs-right');

  // Animation timers
  this.fgsTimer = null;
  this.bgsTimer = null;

  // Create sliders for foreground and background
  this.foreground = new app.Slider(this.elem.find('.message .fgs'), {
    max: Constants.FOREGROUND_COUNT,
    size: Constants.SCREEN_HEIGHT,
    changed: this.fgsChanged_.bind(this)
  });
  this.background = new app.Slider(this.elem.find('.message .bgs'), {
    max: Constants.BACKGROUND_COUNT,
    size: Constants.SCREEN_WIDTH,
    horizontal: true,
    changed: this.bgsChanged_.bind(this)
  });

  this.picker = new app.Picker(this);
  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));
  this.tutorial = new app.shared.Tutorial(this.elem, 'touch-updown touch-leftright',
      'keys-updown keys-leftright', 'spacenav-updown spacenav-leftright');
  this.controls = new app.Controls(this);
  this.tutorial.start();

  this.elem.find('#sharebutton').on('click touchend', this.showShareOverlay_.bind(this));
};

/**
 * Show the share overlay.
 * @private
 */
app.Scene.prototype.showShareOverlay_ = function() {
  var bgNum = this.background.getPosition(0);
  var fgNum = this.foreground.getPosition(0);
  this.shareOverlay.show('https://' + window.location.hostname + '/#postcard?bg=' + bgNum + '&fg=' + fgNum, true);
};

/**
 * Is notified when foreground changes.
 * @private
 * @param {number} selected The number of the selected foreground.
 * @param {number} pos The position of the selected foreground.
 *                     Multiply with width to get position.
 */
app.Scene.prototype.fgsChanged_ = function(selected, pos) {
  // Start change animation with gears rotating
  window.clearTimeout(this.fgsTimer);
  this.fgsTimer = window.setTimeout(function() {
    this.elem.removeClass('fgs-active');
  }.bind(this), 500);
  this.elem.addClass('fgs-active');

  // Animate small fgs on track
  this.fgsTrackElem.each(function() {
    var position = (Constants.SMALL_CHARACTER_HEIGHT * (pos + 1) * -1) +
        ($(this).data('offset') || 0);
    $(this).css('background-position', '0 ' + position + 'px');
  });

  // Animate logo in picker
  this.fgsLogoElem.css('background-position',
      '0 ' + (-1 * Constants.PICKER_ICON_SIZE * pos) + 'px');
};

/**
 * Is notified when background changes.
 * @private
 * @param {number} selected The number of the selected background.
 * @param {number} pos The position of the selected background.
 *                     Multiply with width to get position.
 */
app.Scene.prototype.bgsChanged_ = function(selected, pos) {
  // Start change animation with gears rotating
  window.clearTimeout(this.bgsTimer);
  this.bgsTimer = window.setTimeout(function() {
    this.elem.removeClass('bgs-active');
  }.bind(this), 500);
  this.elem.addClass('bgs-active');

  this.bgsTrackElem.each(function() {
    var position = (Constants.SMALL_SCREEN_WIDTH * (pos + 1) * -1) +
        ($(this).data('offset') || 0);
    $(this).css('background-position', position + 'px 0');
  });
  this.bgsLogoElem.css('background-position',
      '-74px ' + (-1 * Constants.PICKER_ICON_SIZE * pos) + 'px');
};

/**
 * Clean up when scene is closed.
 * @export
 */
app.Scene.prototype.dispose = function() {
  $(window).off('.sendamessage');
  this.elem.off('.sendamessage');
  this.tutorial.dispose();
};
