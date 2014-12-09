/**
 * Converts a Santa LatLng object to a Maps API LatLng.
 *
 * @param {LatLng} o
 * @return {google.maps.LatLng}
 */
function mapsLatLng(o) {
  return new google.maps.LatLng(o.lat, o.lng);
}

/**
 * Pads an integer to have two digits.
 * @param {number} n
 * @return {string|number}
 */
function pad(n) {
  if (n > 9) {
    return n;
  }
  return '0' + n;
}

/**
 * Formats a number according to user's locale.
 * @param {number} n
 * @return {string}
 */
function formatInt(n) {
  if (n < 1000) {
    return n.toFixed(0);
  }
  var s = n.toFixed(0);
  var ret = '';
  while (s.length > 3) {
    var l = s.length - 3;
    ret = s.slice(l) + (ret ? formatInt.sep : '') + ret;
    s = s.slice(0, l);
  }
  return ret = s + formatInt.sep + ret;
}
formatInt.sep = (.1).toLocaleString().indexOf(',') != -1 ? '.' : ',';

function formatDistance(dist) {
  // TODO: localise? (miles)
  // 0xA0 non-breaking space
  return formatInt(Math.floor(dist / 1000)) + '\xA0km';
};