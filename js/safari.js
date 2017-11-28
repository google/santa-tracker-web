/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Works around Safari's media query bug in Shadow Roots.
 */

const ua = navigator.userAgent;
if (ua.indexOf('Chrome') === -1 && ua.indexOf('Safari') !== -1) {
  const s = document.createElement('style');
  document.body.appendChild(s);
  let previousWidth = 0;

  // Safari 11.0.1 doesn't reevaluate media queries inside shadow roots on resize. By modifying a
  // dummy media-query on resize, it seemingly refreshes all of them.
  window.addEventListener('resize', () => {
    // nb. min/max so that whatever resize happens triggers style changes
    // TODO(samthor): This only handles width; the same hack could be used for height?
    const dir = (previousWidth < window.innerWidth ? 'max' : 'min');
    previousWidth = window.innerWidth;
    s.innerHTML = `@media (${dir}-width: ${window.innerWidth}px) {}`;
  });
}