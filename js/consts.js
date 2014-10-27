/**
 * Base directory used for static files.
 * In production, this is somewehere on maps.gstatic.com
 *
 * UpperQuad define this on their page before loading app_all, so just take
 * their value.
 */
var STATIC_DIR = window['STATIC_DIR'] || (function() {
  if (window['DEV']) {
    var override = getUrlParameter('static_dir');
    if (override) {
      return override;
    }
    return '.';
  }
  // NOTE: actual value replaced by the replace_static_dir genrule.
  return 'SANTA_STATIC_DIR';
})();

/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 */
function getUrlParameter(param) {
  if (!window.location.search) return;
  var m = new RegExp(param + '=([^&]*)').exec(
      window.location.search.substring(1));
  if (!m) return;
  return decodeURIComponent(m[1]);
}