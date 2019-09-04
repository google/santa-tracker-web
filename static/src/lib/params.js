
/**
 * Reads search params from the given string.
 * 
 * @param {string} search
 * @return {!Object<string, string>}
 */
export function read(search) {
  const out = {};
  (search || '').substr(1).split('&').forEach((part) => {
    const p = part.split('=');
    const key = decodeURIComponent(p[0] || '');
    if (key && !(key in out)) {
      out[key] = decodeURIComponent(p[1] || '');  // 1st param only
    }
  });
  return out;
}

/**
 * Builds a search param string from the given Object.
 *
 * @param {!Object<string, string>} raw 
 * @return {string}
 */
export function build(raw) {
  const keys = Object.keys(raw || {});
  if (keys.length) {
    const each = keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(raw[key])}`);
    return '?' + each.join('&');
  }
  return '';
}
