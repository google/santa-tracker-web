goog.provide('app.shared.ShareOverlay');

goog.require('app.shared.Overlay');
goog.require('app.shared.ShareButtons');
goog.require('app.shared.utils');

/**
 * Gameover screen.
 * @param {HTMLElement} elem The gameover element.
 * @constructor
 */
app.shared.ShareOverlay = function(elem) {
  this.elem = $(elem);

  this.overlay = new app.shared.Overlay(this.elem);
  this.shareButtons = new app.shared.ShareButtons(this.elem.find('.shareButtons'));

  this.closeElem = this.elem.find('.shareOverlay-close');
  this.urlElem = this.elem.find('.shareOverlay-url');

  if (window.gapi && window.gapi.client) {
    this.urlShortener = window.gapi.client.load('urlshortener', 'v1');
  }

  this.attachEvents_();
};

/**
 * Attaches events to the share screen.
 * @private
 */
app.shared.ShareOverlay.prototype.attachEvents_ = function() {
  this.closeElem.on('click touchend', function() {
    this.hide();
  }.bind(this));

  this.urlElem.on('click touchend', function() {
    this.urlElem[0].select();
  }.bind(this));
};

/**
 * Shows the share screen with an animation.
 * @param {String} url The url to share.
 * @param {bool} shorten Should the url be shortened?
 */
app.shared.ShareOverlay.prototype.show = function(url, shorten) {
  if (!url) {
    throw new Error('No url to share.');
  }

  // Shorten url
  if (shorten) {
    this.shorten_(url, function(shortened) {
      this.show(shortened, false);
    }.bind(this));
    return;
  }

  this.urlElem.val(url.replace(/https?:\/\//i, ''));
  this.shareButtons.setUrl(url);
  this.overlay.show();
};

/**
 * Shorten a url with Google shortener.
 * @param {String} url The long url.
 * @param {Function} callback Call this function with the shortened url.
 * @private
 */
app.shared.ShareOverlay.prototype.shorten_ = function(url, callback) {
  if (!window.gapi || !window.gapi.client) {
    console.warn('Google API not available.');
    callback(url);
    return;
  }

  if (!this.urlShortener) {
    this.urlShortener = window.gapi.client.load('urlshortener', 'v1');
  }

  this.urlShortener.then(function() {
    window.gapi.client.urlshortener.url.insert({
      resource: {
        longUrl: url
      }
    }).execute(function(response) {
      callback(response.id);
    });
  });
};

/**
 * Hides the share screen with an animation.
 * @param  {Function} callback Runs when the animation is finished.
 */
app.shared.ShareOverlay.prototype.hide = function(callback) {
  this.overlay.hide(callback);
};
