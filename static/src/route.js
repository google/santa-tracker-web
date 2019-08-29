
// This reads either the prod domain, or the prod domain from _within_ the static scope via the
// document/iframe referrer.
const {scope, lang} = (function() {
  const href = (window.top == window ? window.location.href : document.referrer) || 'https://santatracker.google.com/';
  const url = new URL('./', href);
  const scope = url.toString();

  // This is a simpler language regexp than in entrypoint, as we assume callers here are only from sources we control.
  const matchLang = url.pathname.match(/^\/intl\/(\w+)\//);
  const lang = matchLang && matchLang[1] || null;

  return {scope, lang}
}());


/**
 * @param {string} cand candidate href
 * @return {string} href with scope as appropriate
 */
export function href(cand) {
  if (cand == null) {
    return cand;
  }
  return new URL(cand, scope);
}


/**
 * @param {string} url to localize
 * @return {string} localized url
 */
export function localize(url) {
  if (lang) {
    const u = new URL(url);
    u.searchParams.set('hl', lang);
    return u.toString();
  }
  return url;
}
