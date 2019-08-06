import {unsafeHTML} from 'lit-html/directives/unsafe-html';


const messagesJSON =
    window.fetch('./en_src_messages.json').then((out) => out.json());


export async function runtimeTranslate(runtimeId) {
  // TODO(samthor): Implement mapping code.
  const id = runtimeId.replace('/', '_');

  let messages;
  try {
    messages = await messagesJSON;
  } catch (e) {
    console.warn('could not get runtime message', runtimeId, e);
    return '?';
  }

  const data = messages[id];
  if (!data) {
    return '?'
  }
  if (data.raw) {
    return unsafeHTML(data.raw);
  }
  return data.message || '?';
}


export function getLanguage() {
  return document.documentElement.lang;
}
