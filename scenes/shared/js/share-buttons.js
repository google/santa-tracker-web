goog.provide('app.shared.ShareButtons');

goog.require('app.shared.utils');

/**
 * Share buttons.
 * @param {!HTMLElement} elem The share buttons element.
 * @param {string} url The url to share.
 * @constructor
 */
app.shared.ShareButtons = function(elem, url) {
  this.elem = $(elem);
  this.setUrl(url);

  // Open in a popup
  this.elem.find('a').on('click', this.handleClick_);
};

/**
 * Change the url to share.
 * @param url {string} The url.
 */
app.shared.ShareButtons.prototype.setUrl = function(url) {
  url = window.encodeURIComponent(url || window.location.href);
  this.elem.find('.shareButtons-google')
      .attr('href', 'https://plus.google.com/share?url=' + url);
  this.elem.find('.shareButtons-facebook')
      .attr('href', 'https://www.facebook.com/sharer.php?p[url]=' + url + '&u=' + url);
  this.elem.find('.shareButtons-twitter')
      .attr('href', 'https://twitter.com/share?hashtags=santatracker&url=' + url);
};

/**
 * Open the share dialogs in a popup window.
 * @param event {!Event} The click event.
 * @private
 */
app.shared.ShareButtons.prototype.handleClick_ = function(event) {
  event.preventDefault();
  var el = $(this);
  var width = 600, height = 600;

  if (el.hasClass('shareButtons-twitter')) {
    height = 253;
  }
  else if (el.hasClass('shareButtons-facebook')) {
    height = 229;
  }
  else if (el.hasClass('shareButtons-google')) {
    height = 348;
    width = 512;
  }

  var options = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=' + height + ',width=' + width;
  window.open(this.href, '', options);
};
