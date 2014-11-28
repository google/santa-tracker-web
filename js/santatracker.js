(function() {

var DEFAULT_ROUTE = 'village';
var TRACKER_ROUTE = 'tracker';
var VALID_ROUTES = [];

var template = document.querySelector('#t');

window.santatracker = {};

window.santatracker.setup = function() {
  window.santatracker.addErrorHandler();

  if (!window.santatracker.isValidDomain()) {
    window.location.pathname = '';
    return;
  }

  window.santatracker.setupForCast();

  template.addEventListener('template-bound', function(e) {
    window.santaApp = document.querySelector('santa-app');
    I18nMsg.lang = santaApp.language; // Set locale for entire site (e.g. i18n-msg elements).
  });

  template.onRouteChange = function(e) {
    var route = e.detail;

    if (!route) {
      this.route = window.santaApp.postCountdown ? TRACKER_ROUTE : DEFAULT_ROUTE;
      return;
    }

    // Special case certain routes. The rest are handled by lazy-pages.
    switch (route) {
      case 'now':
        this.route = 'village';
        break;
      default:
        this.validateRoute();
    }

    window.santaApp.fire('analytics-track-pageview', {path: '/' + this.route});
  };

  template.validateRoute = function() {
    // Ideally, we'd init VALID_ROUTES on page load, but the auto-binding
    // template needs to be activate first and onRouteChange() is called
    // right away.
    if (!VALID_ROUTES.length) {
      var scenes = document.querySelector('lazy-pages').items;
      VALID_ROUTES = scenes.map(function(el, i) {
        // Note: can't use .route b/c some scene elements won't be upgraded yet.
        return el.getAttribute('route');
      });
    }

    console.log(VALID_ROUTES);

    if (window.santaApp.scheduleChecked != undefined) {
      var valid = (VALID_ROUTES.indexOf(this.route) != -1 &&
                   window.santaApp.sceneIsUnlocked(this.route)) ||
                   (window.santaApp.postCountdown && this.route == TRACKER_ROUTE);
      if (!valid) {
        this.route = DEFAULT_ROUTE;
      }
    }
  };

};

document.addEventListener('santa-schedule-first-check', function(e) {
  if (!template.route) {
    return;
  }
  template.validateRoute();
});

window.santatracker.isValidDomain = function() {
  if (window['DEV']) return true;

  // We only have approval for these domains.
  var domains = ['com', 'ad', 'ae', 'com.ag', 'it.ao', 'com.ar', 'as', 'at',
      'com.au', 'com.bd', 'be', 'bf', 'bg', 'com.bh', 'bi', 'bj', 'com.bo',
      'com.br', 'bs', 'bt', 'co.bw', 'com.bz', 'ca', 'cd', 'cf', 'cg', 'ch',
      'ci', 'cl', 'cm', 'co.ao', 'co.cr', 'com.cu', 'cz', 'de', 'dj', 'dk',
      'dm', 'com.do', 'dz', 'com.ec', 'ee', 'com.eg', 'es', 'com.et', 'fi',
      'com.fj', 'fm', 'fr', 'ga', 'com.gh', 'gm', 'gp', 'gr', 'com.gt', 'gy',
      'com.hk', 'hn', 'hr', 'ht', 'hu', 'co.id', 'ie', 'co.il', 'co.in', 'iq',
      'is', 'it', 'com.jm', 'jo', 'jp', 'co.ke', 'com.kh', 'co.kr', 'com.kw',
      'la', 'com.lb', 'li', 'lk', 'co.ls', 'lt', 'lu', 'lv', 'com.ly', 'mg',
      'mk', 'ml', 'mn', 'com.mt', 'mu', 'mv', 'mw', 'com.mx', 'com.my', 'co.mz',
      'com.na', 'ne', 'com.ng', 'com.ni', 'nl', 'no', 'com.np', 'co.nz',
      'com.om', 'com.pa', 'com.pe', 'com.ph', 'pl', 'com.pr', 'pt', 'com.py',
      'com.qa', 'ro', 'rs', 'ru', 'rw', 'com.sa', 'sc', 'se', 'com.sg', 'si',
      'sk', 'com.sl', 'sn', 'so', 'st', 'com.sv', 'td', 'tg', 'co.th', 'tn',
      'to', 'tt', 'com.tw', 'co.tz', 'com.ua', 'co.ug', 'co.uk', 'com.uy',
      'com.vc', 'co.ve', 'vu', 'ws', 'co.za', 'co.zm', 'co.zw'
  ];
  for (var i = 0, d; d = '.' + domains[i]; i++) {
    if (document.domain.indexOf(d) + d.length == document.domain.length) {
      return true;
    }
  }
  return false;
};

window.santatracker.setupForCast = function() {
  // TODO(lukem): Add support for keyboard controls, see jfs for more details.

  /*

  if (getUrlParameter('api_client') == 'web_chromecast' ||
      getUrlParameter('emulate_chromecast') ||
      // NOTE(cbro): for news outlets that are embedding the site, use the same
      // behaviour as for Chromecast.
      getUrlParameter('embed_client')) {

    $(document.body).addClass('chromecast');

    $('<a>')
        .attr('id', 'click-capture')
        .attr('href', 'https://www.google.com/santatracker')
        .attr('target', 'santatracker')
        .click(function() {
          window.santatracker.analytics.trackEvent('embed', 'click',
              getUrlParameter('embed_client'));
        })
        .appendTo(document.body);
  }

  */
};

window.santatracker.addErrorHandler = function() {
  // Track and log any errors to analytics
  window.onerror = function(message, file, lineNumber) {
    // We don't want to trigger any errors inside window.onerror otherwise
    // things will get real bad, real quick.
    try {
      window.santaApp.fire('analytics-track-event', {
          category: 'error', action: file + ':' + lineNumber,
          label: '' + message});
    } catch (e){}
  };
};

document.addEventListener('HTMLImportsLoaded', function() {
  window.santatracker.setup();
});

})();
