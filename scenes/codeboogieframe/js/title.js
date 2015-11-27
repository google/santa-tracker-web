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

'use strict';

goog.provide('app.Title');

app.Title = class {
  constructor(el) {
    this.titleEl = el;
    this.textEl = null;
    this.subTextEl = null;
    this.toRemove = [];
  }

  setTitle(text, smaller, subText) {
    this.textEl = this.switchText_(this.textEl, text,
                                   smaller ? 'title title--small' : 'title');
    this.subTextEl = this.switchText_(this.subTextEl, subText,
                                      'title title--small title--sub');
  }

  switchText_(el, newText, classes) {
    let changed = el ? newText !== el.textContent : newText;
    if (el && changed) {
      el.className += ' title--destroy';
      this.toRemove.push(el);
      el = null;
    }

    if (changed) {
      el = document.createElement('span');
      el.textContent = newText;
      el.className = classes;
      this.titleEl.appendChild(el);
    }

    return el;
  }

  onBeat() {
    let el;
    while (el = this.toRemove.pop()) {
      el.remove();
    }
  }
};
