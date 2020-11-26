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

import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'
import Sketch from './components/Sketch/Sketch.js'

import { CHAPTERS } from './model.js'

export default class Storybook {
  constructor(el, touchEnabled) {
    this.el = el;
    this.touchEnabled = touchEnabled;
    this.useGLCanvas = !this.touchEnabled();

    this.activeIndex = 0;
    this.pages = CHAPTERS.length;

    this.nav = this.el.querySelector('[data-nav]');
    this.slider = this.el.querySelector('[data-slider]');

    this.lullabyPlaying = false;
    this.musicSwitchPage = 19; // page on which to switch to lullaby music

    if (this.useGLCanvas) {
      Sketch.start();
    } else {
      this.el.classList.add('is-touch-device');
    }

    this.init();
  }

  init() {
    Nav.init(this.nav, this.activeIndex, this.pages, this.useGLCanvas);
    Slider.init(this.slider, this.activeIndex, this.pages, this.useGLCanvas);

    window.addEventListener('storybook_update', this.onUpdate.bind(this));
  }

  onUpdate(e) {
    let id = e.detail;
    if (id > this.musicSwitchPage && !this.lullabyPlaying) {
      window.santaApp.fire('sound-trigger', 'storybook_lullabye');
      this.lullabyPlaying = true;
    } else if (id < this.musicSwitchPage && this.lullabyPlaying){
      window.santaApp.fire('sound-trigger', 'storybook_start');
      window.santaApp.fire('sound-trigger', 'storybook_transition');
      this.lullabyPlaying = false;
    }
  }
}