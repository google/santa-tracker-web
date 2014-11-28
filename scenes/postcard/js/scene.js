goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.Picker');
goog.require('app.Slider');
goog.require('app.shared.ShareOverlay');
goog.require('app.shared.Tutorial');

/**
 * Main scene class.
 * @param {Element} elem The scene element.
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
    changed: this.fgsChanged.bind(this)
  });
  this.background = new app.Slider(this.elem.find('.message .bgs'), {
    max: Constants.BACKGROUND_COUNT,
    size: Constants.SCREEN_WIDTH,
    horizontal: true,
    changed: this.bgsChanged.bind(this)
  });

  this.picker = new app.Picker(this);
  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));
  this.tutorial = new app.shared.Tutorial(this.elem, 'touch-updown touch-leftright',
      'keys-updown keys-leftright');
  this.controls = new app.Controls(this);
  this.tutorial.start();

  this.elem.find('.share-this').on('click touchend', this.showShareOverlay_.bind(this));
};

/**
 * Show the share overlay.
 * @private
 */
app.Scene.prototype.showShareOverlay_ = function() {
  this.shareOverlay.show(window.location.href, true);
};

/**
 * Is notified when foreground changes.
 * @param {number} selected The number of the selected foreground.
 * @param {number} pos The position of the selected foreground.
 *                     Multiply with width to get position.
 */
app.Scene.prototype.fgsChanged = function(selected, pos) {
  // Start change animation with gears rotating
  clearTimeout(this.fgsTimer);
  this.fgsTimer = setTimeout(function() {
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
 * @param {number} selected The number of the selected background.
 * @param {number} pos The position of the selected background.
 *                     Multiply with width to get position.
 */
app.Scene.prototype.bgsChanged = function(selected, pos) {
  // Start change animation with gears rotating
  clearTimeout(this.bgsTimer);
  this.bgsTimer = setTimeout(function() {
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
