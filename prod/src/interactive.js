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


let done = (document.readyState === 'interactive' || document.readyState === 'complete');
let all;

if (!done) {
  all = [];
  window.addEventListener('DOMContentLoaded', () => {
    done = true;
    all.forEach((fn) => fn());
    all = undefined;
  });
}

export default function onInteractive(fn) {
  if (!done) {
    all.push(fn);
  } else {
    fn();
  }
}
