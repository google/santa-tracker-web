import {unsafeHTML} from 'lit-html/directives/unsafe-html';


export function runtimeTranslate(id) {
  // TODO(samthor): Implement mapping code.
  return _msg(id.replace('/', '_'));
}


export function getLanguage() {
  return 'en';
}


function languageFromUrl() {
  // Look for /intl/../ (look for _last_). This wins over ?hl=...
  const match = window.location.pathname.match(/.*\/intl\/([^_/]+)(?:|_ALL)\//);
  let lang = match && match[1];

  // Otherwise, look for ?hl=....
  if (!lang) {
    const search = window.location.search || '';
    const matchLang = /(?:\?|&)hl=([^&]*)\b/;
    const match = matchLang.exec(search);
    lang = match && match[1];
  }

  return lang || '';
}


const loadedWithLang = languageFromUrl();


export function localizeUrl(url) {
  if (!loadedWithLang) {
    return url;
  }
  const hasQuery = url.indexOf('?') !== -1;
  return url + (hasQuery ? '&' : '?') + `hl=${loadedWithLang}`;
}


const messagesJSON = window.fetch('./en_src_messages.json').then((out) => out.json());

export async function _msg(id) {
  const messages = await messagesJSON;
  const data = messages[id];
  if (!data) {
    return '?'
  }
  if (data.raw) {
    return unsafeHTML(data.raw);
  }
  return data.message || '?';
}

