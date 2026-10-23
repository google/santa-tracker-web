/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Reads a translated string that the scene needs from JavaScript rather than
 * from markup.
 *
 * Strings live as hidden `[msgid]` elements in index.html: the release build
 * rewrites them with the translated text, and the inline English inside each
 * one is what shows during development.
 *
 * The obvious alternative, importing `_msg` from `src/magic.js`, does not work
 * here for two reasons. Importing that module rewrites the `innerHTML` of every
 * `[msgid]` element on the page as a side effect, which would clobber the
 * scene's own inline fallbacks. And its lookup table is built from
 * `_messages/en.json`, which only holds strings that have already been through
 * translation — so any string added alongside a feature resolves to `?` until
 * the translation round trip completes.
 */
export function sceneString(msgid) {
  const element = document.querySelector(`[msgid="${msgid}"]`);

  if (element == null) {
    console.warn('No string for msgid', msgid);
    return '';
  }

  return element.textContent.trim();
}
