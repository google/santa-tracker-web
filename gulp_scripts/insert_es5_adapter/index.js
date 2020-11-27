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

// Insert the Custom Elements ES5 Adapter into a JSDom document
// @see https://github.com/webcomponents/webcomponentsjs#custom-elements-es5-adapterjs
// @see https://github.com/webcomponents/webcomponentsjs/blob/master/custom-elements-es5-adapter.js
module.exports = (document, staticUrl) => {
  const cursor = document.head.querySelector('#ES5_ADAPTER');

  if (cursor == null) {
    return;
  }

  const conditionScript = document.createElement('script');
  conditionScript.textContent =
      `if (!window.customElements) { document.write('<!--') }`;
  const adapterScript = document.createElement('script');
  adapterScript.setAttribute('src',
      `${staticUrl}components/webcomponentsjs/custom-elements-es5-adapter.js`);
  const meaningfulComment = document.createComment('!do not remove');

  document.head.insertBefore(conditionScript, cursor);
  document.head.insertBefore(adapterScript, cursor);
  document.head.insertBefore(meaningfulComment, cursor);

  document.head.removeChild(cursor);
};
