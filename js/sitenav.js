//TODO(lukem): Rewrite this whole thing when new nav comes from designers

/**
 * @constructor
 */
function SiteNav() {
  /**
   * @type {boolean}
   * @private
   */
  this.open_ = false;

  this.container_ = $('#site-nav');
  this.addEvents = this.addEvents_;
}

SiteNav.prototype.addClass = function(c) {
  this.container_.addClass(c);
};

SiteNav.prototype.open = function() {
  /*
  if (this.open_) return;
  this.open_ = true;
  window.clearTimeout(this.closeTimeout_);
  $('#global-nav-content').scrollTop(0);
  $('#global-nav-header ul li a').first().click();

  $('#global-nav').removeClass('closed closing scrollable').addClass('opening');
  window.setTimeout(function() {
    $('#global-nav').addClass('opened');
    window.setTimeout(function() {
      $('#global-nav').addClass('scrollable');
    }, 300 + (24 * 42));
  }, 0);

  Klang.triggerEvent('menu_open');
  window.santatracker.visibility.pause();
  */
};

SiteNav.prototype.close = function() {
  /*
  if (!this.open_) return;
  this.open_ = false;
  $('#global-nav').removeClass('opening opened scrollable').addClass('closing');
  this.closeTimeout_ = window.setTimeout(function() {
    $('#global-nav').addClass('closed');
  }, 300 + (24 * 42));

  Klang.triggerEvent('menu_close');
  window.santatracker.visibility.resume();
  */
};

/**
 * @private
 */
SiteNav.prototype.toggle_ = function() {
  /*
  if (this.open_) {
    this.close();
  } else {
    this.open();
  }
  */
};

/**
 * @param {Event} e
 * @return {boolean} false to cancel the bubble
 * @private
 */
SiteNav.prototype.changeNavTab_ = function(e) {
  /*
  $('#global-nav-header .active').removeClass('active');
  var link = $(e.target);
  link.addClass('active');
  var type = link.attr('href').substring(1);

  if (type == 'calendar') {
    $('#nav-calendar').show();
    $('#nav-onthego').hide();
  } else {
    $('#nav-onthego').show();
    $('#nav-calendar').hide();
  }
  return false;
  */
};

SiteNav.prototype.addEvents_ = function() {
  /*
  var container = this.container_;
  $('#global-nav-btn').on('click', _.bind(this.toggle_, this));
  $('#global-back-to-village').on('click', _.bind(this.close, this));
  $('#global-nav-content li').on('click', 'a.melt', _.bind(this.close, this));

  container.on('click', '.gplus', _.bind(this.shareGplus, this));
  container.on('click', '.fb', _.bind(this.shareFB, this));
  container.on('click', '.twitter', _.bind(this.shareTwitter, this));

  $('#nav-calendar ul li').on('click', 'a', function() {
    if ($(this).hasClass('iced')) return false;
  });

  $('#global-nav-header ul li').on('click', 'a',
      _.bind(this.changeNavTab_, this));
  this.addLanguageSelectEvents_();

  $('#nav-onthego a').on('click', function() {
    var href = $(this).attr('href');
    window.santatracker.analytics.trackEvent('outbound', 'click', href);
    window.setTimeout(function() {
      document.location.href = href;
    }, 100);
    return false;
  });
  */
}

/**
 * @private
 */
SiteNav.prototype.addLanguageSelectEvents_ = function() {
  /*
  $('#select-lang').on('click', function(e) {
    $('#page-language').show();
    e.preventDefault(); // necessary for standalone village, but not web.
  });

  // Prevent a click on the language select from closing the form.
  $('#language-content').on('click', function(e) {
    return false;
  });

  var hidePopup = function() {
    $('#page-language').hide();
    return false;
  };

  $('#page-language').on('click', hidePopup);
  $('#close-lang').on('click', hidePopup);

  $('#language').val(window.santatracker.lang);

  $('#language').on('change', function() {
    var lang = $(this).val();
    window.santatracker.analytics.trackEvent('language', 'click', 'change',
        lang);
    window.setTimeout(function() {
      window.location = '/intl/' + lang + '/santatracker/' +
          window.location.hash;
    }, 100);
  });
  */
};


SiteNav.prototype.shareGplus = function() {
  /*
  window.santatracker.analytics.trackSocial('googleplus', 'share',
      'http://www.google.com/santatracker');
  this.openPage_('https://plus.google.com/share?url=' +
                 encodeURIComponent('http://www.google.com/santatracker'));
  */
};

SiteNav.prototype.shareFB = function() {
  /*
  window.santatracker.analytics.trackSocial('facebook', 'share',
      'http://www.google.com/santatracker');

  this.openPage_('http://www.facebook.com/sharer.php?u=' +
                 encodeURIComponent('http://www.google.com/santatracker') +
                 '&t=' + encodeURIComponent('Google Santa Tracker'));
  */
};

SiteNav.prototype.shareTwitter = function() {
  /*
  window.santatracker.analytics.trackSocial('twitter', 'share',
      'http://www.google.com/santatracker');

  this.openPage_('http://twitter.com/share?text=' +
                 encodeURIComponent('Google Santa Tracker - ' +
                 'Follow Santa on his journey around the ' +
                 'world -') + '&url=' +
                 encodeURIComponent('http://www.google.com/santatracker'));
  */
};

/**
 * Open a fixed size window to a url
 * @param {string} url
 */
SiteNav.prototype.openPage_ = function(url) {
  window.open(url, 'Share', 'toolbar=0,status=0,width=626,height=480');
};