/*
 * Copyright 2015 Google Inc. All rights reserved.
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

(function() {
var container = document.getElementById('santa-tracker-container');
if (container) {
  var iframe = document.createElement('iframe');
  iframe.width = iframe.height = '100%';
  iframe.style.border = '0';
  iframe.style.minHeight = '350px';
  iframe.style.minWidth = '500px';
  iframe.style.maxHeight = '500px';
  iframe.style.maxWidth = '800px';
  container.style.display = 'inline-block';
  container.style.height =
      (parseInt(getComputedStyle(container).height) || 400) + 'px';
  container.style.width =
      (parseInt(getComputedStyle(container).width) || 600) + 'px';
  iframe.style.maxWidth = '800px';

  var siteUrl = encodeURIComponent(window.location.href);
  iframe.src = 'https://santatracker.google.com/?api_client=web_embed&site=' +
               siteUrl + '#village';
  container.appendChild(iframe);
}
})();
