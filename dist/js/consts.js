/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 */
function getUrlParameter(param) {
  if (!window.location.search) {
    return;
  }
  var m = new RegExp(param + '=([^&]*)').exec(
      window.location.search.substring(1));
  if (!m) {
    return;
  }
  return decodeURIComponent(m[1]);
}
