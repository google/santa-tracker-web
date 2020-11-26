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

export const withinFrame = window.parent && window.parent != window;

/**
 * @param {function(*): void} callback to invoke when data is received
 * @return {function(*) void} to send across channel, but does nothing if not in frame
 */
export function parent(callback) {
  if (!withinFrame) {
    return () => {};  // literally do nothing
  }

  const {port1, port2} = new MessageChannel();
  window.parent.postMessage(port2, '*', [port2]);
  port1.onmessage = (ev) => callback(ev.data);
  return port1.postMessage.bind(port1);
}
