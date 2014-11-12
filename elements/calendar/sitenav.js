/**
 * Singleton.
 * @return {SiteNavImpl}
 */
function SiteNav() {
  if (!SiteNav.INSTANCE_) {
    SiteNav.INSTANCE_ = new SiteNavImpl();
  }
  return SiteNav.INSTANCE_;
}

/**
 * @constructor
 */
function SiteNavImpl() {
  /**
   * @type {boolean}
   * @private
   */
  this.open_ = false;

  this.container_ = $('#site-nav');
  this.addEvents = _.once(this.addEvents_);

  window.setTimeout(_.bind(this.preloadImages_, this), 5000);
}

/**
 * Preloads images for the buttons before the user clicks on the nav button.
 * @private
 */
SiteNavImpl.prototype.preloadImages_ = function() {
  var img = new Image();
  if (window.devicePixelRatio && window.devicePixelRatio > 1) {
    img.src = STATIC_DIR + '/images/menuicons_2x.png';
  } else {
    img.src = STATIC_DIR + '/images/menuicons.png';
  }
  if (window['DEV']) {
    img.onerror = function() {
      window.console.warn('menuicons couldnt be preloaded.');
    };
  }
};

SiteNavImpl.prototype.addClass = function(c) {
  this.container_.addClass(c);
};

SiteNavImpl.prototype.open = function() {
  if (this.open_) return;
  this.open_ = true;
  window.clearTimeout(this.closeTimeout_);
  $('#global-nav-content').scrollTop(0);
  $('#global-nav-header ul li a').first().click();

  $('#global-nav').removeClass('closed closing').addClass('opening');
  window.setTimeout(function() {
    $('#global-nav').addClass('opened');
  }, 0);

  Klang.triggerEvent('menu_open');
  window.santatracker.visibility.pause();
};

SiteNavImpl.prototype.close = function() {
  if (!this.open_) return;
  this.open_ = false;
  $('#global-nav').removeClass('opening opened').addClass('closing');
  this.closeTimeout_ = window.setTimeout(function() {
    $('#global-nav').addClass('closed');
  }, 300 + (24 * 42));

  Klang.triggerEvent('menu_close');
  window.santatracker.visibility.resume();
};

/**
 * @private
 */
SiteNavImpl.prototype.toggle_ = function() {
  if (this.open_) {
    this.close();
  } else {
    this.open();
  }
};

/**
 * @param {Event} e
 * @return {boolean} false to cancel the bubble
 * @private
 */
SiteNavImpl.prototype.changeNavTab_ = function(e) {
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
};

SiteNavImpl.prototype.addEvents_ = function() {
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
      document.location.href = /** @type {string} */(href);
    }, 100);
    return false;
  });
}

/**
 * @private
 */
SiteNavImpl.prototype.addLanguageSelectEvents_ = function() {
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

  var lang = /** @type {string} */($('html').attr('lang') || 'en');
  $('#language').val(lang);

  $('#language').on('change', function() {
    var lang = $(this).val();
    window.santatracker.analytics.trackEvent('language', 'click', 'change',
        lang);
    window.setTimeout(function() {
      window.location = '/intl/' + lang + '/santatracker/' +
          window.location.hash;
    }, 100);
  });
};


SiteNavImpl.prototype.shareGplus = function() {
  window.santatracker.analytics.trackSocial('googleplus', 'share',
      'http://www.google.com/santatracker');
  this.openPage_('https://plus.google.com/share?url=' +
                 encodeURIComponent('http://www.google.com/santatracker'));
};

SiteNavImpl.prototype.shareFB = function() {
  window.santatracker.analytics.trackSocial('facebook', 'share',
      'http://www.google.com/santatracker');

  this.openPage_('http://www.facebook.com/sharer.php?u=' +
                 encodeURIComponent('http://www.google.com/santatracker') +
                 '&t=' + encodeURIComponent('Google Santa Tracker'));
};

SiteNavImpl.prototype.shareTwitter = function() {
  window.santatracker.analytics.trackSocial('twitter', 'share',
      'http://www.google.com/santatracker');

  this.openPage_('http://twitter.com/share?text=' +
                 encodeURIComponent('Google Santa Tracker - ' +
                 'Follow Santa on his journey around the ' +
                 'world -') + '&url=' +
                 encodeURIComponent('http://www.google.com/santatracker'));
};

/**
 * Open a fixed size window to a url
 * @param {string} url
 */
SiteNavImpl.prototype.openPage_ = function(url) {
  window.open(url, 'Share', 'toolbar=0,status=0,width=626,height=480');
};
