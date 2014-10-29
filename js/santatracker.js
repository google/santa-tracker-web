window.santatracker = {};
window.santatracker.DEFAULT_ROUTE_ = 'village';

/**
 * @const
 * @type {number}
 */
window.santatracker.COUNTDOWN_END_DATE = 1419415200000; // Dec 24, 2014

/**
 * @const
 * @type {number}
 */
window.santatracker.FLIGHT_FINISHED =
    window.santatracker.COUNTDOWN_END_DATE + 25 * 60 * 60 * 1000;

window.santatracker.analytics = new Analytics();

/**
 * @type {!MuteState}
 */
//window.santatracker.muteState = new MuteState;
//window.santatracker.visibility = new VisibilityManager;

window.santatracker.setup = function() {
  window.santatracker.addErrorHandler();
  if (!window.santatracker.isValidDomain()) {
    window.location.pathname = '';
    return;
  }

  window.santatracker.checkLang();
  window.santatracker.setupForCast();

  window.santatracker.controller = new SantaController(window.santatracker.lang,
      window.santatracker, window.santatracker.analytics);

  // TODO(lukem) Add sound setup here
  // window.soundController = new SoundController();

  // Routing setup is done last.
  var template = document.querySelector('#t');
  template.addEventListener('template-bound', function(e) {
    template.route = template.route || window.santatracker.DEFAULT_ROUTE_;
  });
};

window.santatracker.checkLang = function() {
  var lang = document.documentElement.lang;
  if (window['DEV']) {
    // Force the language using the "hl" parameter when testing.
    // Useful for sending a different language to the API.
    lang = getUrlParameter('hl') || lang;
  }

  window.santatracker.lang = lang;
};

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
      window.santatracker.analytics.trackEvent('error', file + ':' + lineNumber,
        '' + message);
    } catch (e){}
  };
};

// TODO(ericbidelman): temp stub.
Klang = {
  triggerEvent: function(){},
};

window.santatracker.setup();
