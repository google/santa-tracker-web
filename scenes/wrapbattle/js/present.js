/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('app.Present');

goog.require('app.Constants')

app.Present = class {
  /**
   * A present for the elves to wrap
   * @param  {app.Character} elf The elf wrapping this present
   */
  constructor(elf) {
    this.elf = elf;
    this.presentEl = $('.present', this.elf.frontEl);
    this.toyEl = $('.present-toy', this.elf.frontEl);
    this.boxEl = $('.present-box', this.elf.frontEl);
    this.playing = false;

    this.boxClass = null;
    this.toyClass = null;
  }

  /**
   * Initialize the present assets
   * @param  {string} color   The present color
   * @param  {boolean} success Whether the present was wrapped successfully
   */
  init(color, success) {
    this.playing = true;
    const toy = Math.ceil(Math.random() * 8);

    this.toyClass = `present-toy--${toy}`;
    this.boxClass = `present-box--${color}-${success}`;

    this.toyEl.addClass(this.toyClass);
    this.boxEl.addClass(this.boxClass);

    this.presentEl.css('left', this.elf.elfOffset +
          (this.elf.frontCanvas.width - this.presentEl.width()) / 2);
    if (!success) {
      window.santaApp.fire('sound-trigger','wrapbattle_wrap_present_fail');
    }
  }

  /**
   * Show the toy
   */
  showToy() {
    this.toyEl.addClass('is-active');
  }

  /**
   * Hide the toy
   */
  hideToy() {
    setTimeout(() => this.toyEl.removeClass(`is-active`), 200);
    window.santaApp.fire('sound-trigger','wrapbattle_wrap_present');
  }

  /**
   * Show the wrapped present
   */
  showBox() {
    this.boxEl.addClass('is-active');
    setTimeout(this.hideBox.bind(this), 500);
  }

  /**
   * Hide the present box
   */
  hideBox() {
    this.boxEl.removeClass('is-active');
    this.playing = false;
  }

  /**
   * Clean up present state
   */
  cleanUp() {
    this.toyEl.removeClass(`is-active ${this.toyClass}`);
    this.boxEl.removeClass(`is-active ${this.boxClass}`);
    this.toyClass = null;
    this.boxClass = null;
    this.playing = false;
  }
};
