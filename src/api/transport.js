
const MAX_RETRIES = 3;
const TIMEOUT = 5000;


/**
 * @param {?Object<string, (string|number)>} data
 * @return {string}
 */
function buildQueryString(data) {
  if (!data) {
    return '';
  }
  const enc = window.encodeURIComponent;
  const mapper = (key) => `${enc(key)}=${enc(data[key])}`;

  const out = Object.keys(data).map(mapper).join('&');
  return out ? `?${out}` : '';
}


/**
 * Performs a cross-domain XHR to fetch JSON.
 *
 * @param {string} url
 * @return {!Promise<!Object<string, *>>}
 */
function fetchJSON(url) {
  const xhrPromise = new Promise((resolve) => xhrRequest(url, resolve));
  return xhrPromise.then((xhr) => {
    if (xhr instanceof Error) {
      throw xhr;  // we only pass resolve to xhrRequest; rethrow with Error
    }

    let out;
    try {
      out = JSON.parse(xhr.responseText);
    } catch (e) {
      console.warn('invalid JSON from API', url);
      console.debug('raw response', this.responseText)
      throw e;
    }
    if (!out || typeof out !== 'object') {
      console.warn('non-object JSON return', out);
      return {'status': out};
    }
    return out;
  });
}


/**
 * @param {string} url
 * @param {function(!XMLHttpRequest)} resolve to call with loaded XHR
 * @param {number=} requestNo request count, for retries
 */
function xhrRequest(url, resolve, requestNo=0) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.timeout = TIMEOUT;  // IE needs this >open but <send
  xhr.onload = () => resolve(xhr);
  xhr.onerror = () => {
    if (requestNo >= MAX_RETRIES) {
      return resolve(new Error(`exceeded retry limit for: ${url}`));
    }
    ++requestNo;

    // Retry with exponential backoff (625ms, ~1.5s, ~4s, ~10s, ...).
    const at = Math.pow(2.5, requestNo) * 250;
    console.debug('xhr failure, retry', requestNo, 'delay', at, 'url', url);
    window.setTimeout(() => xhrRequest(url, resolve, requestNo), at);
  };
  xhr.send(null);
}


/**
 * Performs a cross-domain AJAX request to the Santa API.
 *
 * @param {string} url
 * @param {?Object<string, (string|number)>=} data
 * @return {!Promise<!Object<string, *>>}
 */
export function request(url, data=null) {
  const query = buildQueryString(data);
  return fetchJSON(url + query);
}

