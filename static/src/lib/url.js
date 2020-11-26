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
 * Joins the given URL and any following paths.
 *
 * @param {string|!URL} url to start with
 * @param  {...string} paths to append
 */
export function join(url, ...paths) {
  let u = new URL(url, window.location);  // 2nd arg only needed in single-domain serving

  while (paths.length) {
    let next = String(paths.shift());
    if (!next.endsWith('/') && paths.length) {
      next += '/';
    }
    u = new URL(next, u);
  }

  // It's not clear what domain this loads from, so just return the whole URL.
  return u.toString();
}
