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

'use strict'

goog.provide('app.Title');
goog.require('app.Step');

const moveMap = {
  [app.Step.FAIL]: 'oops',
  [app.Step.CARLTON]: 'success'
}

app.Title = class {
  constructor() {
    this.title = document.querySelector('.scene__word-title');
  }

  setTitle (text) {
    if (moveMap[text]) {
      text = moveMap[text];
    }

    let translation = app.I18n.getMsg('CB_' + text);

    this.title.innerHTML = '';

    let span = document.createElement('span');
    span.textContent = translation;

    this.title.appendChild(span);
  }
}
