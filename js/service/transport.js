/**
 * Performs an AJAX request, using CORS if the browser supports it, falling
 * back to JSONP.
 *
 * @param {Object} settings
 */
function crossDomainAjax(settings) {
  if (!crossDomainAjax.corsSupport_) {
    settings['dataType'] = 'jsonp';
  } else {
    settings['dataType'] = 'json';
  }
  // NOTE: timeout may not work in FF 3.0+ if using JSONP.
  settings['timeout'] = settings['timeout'] || 5 * 1000; // 5 second default
  settings['url'] = crossDomainAjax.BASE + settings['url'];
  var done = settings.done;
  var fail = settings.fail;
  settings.done = null; // don't pass to jQuery
  settings.fail = null; // don't pass to jQuery
  jQuery.ajax(settings).done(function() {
    // HACK: until externs allow an argument in the callback.
    var result = arguments[0];
    if (result && result['status'] == 'ERROR') {
      fail && fail();
      return;
    }
    done.apply(null, arguments);
  }).fail(retry);

  var retries = 0;
  function retry() {
    if (retries >= crossDomainAjax.MAX_RETRIES) {
      fail && fail();
      return;
    }
    // Retry with exponential backoff.
    // Approximately: 650ms, 1.5s, 4s (10s, 25s...)
    window.setTimeout(function() {
      jQuery.ajax(settings).done(done).fail(retry);
    }, Math.pow(2.5, retries + 1) * 250);
    retries++;
  }
}

/** @define {boolean} */
crossDomainAjax.BASE = ''; // Set by gulpfile

/**
 * @type {boolean}
 * @private
 */
crossDomainAjax.corsSupport_ = 'withCredentials' in new XMLHttpRequest();

/**
 * @const
 */
crossDomainAjax.MAX_RETRIES = 3;

/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 * @private
 */
crossDomainAjax.getUrlParameter_ = function(param) {
  if (!window.location.search) return;
  var m = new RegExp(param + '=([^&]*)').exec(
      window.location.search.substring(1));
  if (!m) return;
  return decodeURIComponent(m[1]);
};
