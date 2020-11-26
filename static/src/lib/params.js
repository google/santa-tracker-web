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
