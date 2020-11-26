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

import TextManager from '../components/TextManager.js';
import Sketch from '../components/Sketch/Sketch.js'
import Slider from './Slider.js';
import Transition from '../components/Transition.js';

class Nav {
  constructor() {
    this.xDown = null;
    this.yDown = null;

    this.animating = false;

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init(el, index, length, useGLCanvas) {
    this.el = el;
    this.useGLCanvas = useGLCanvas;
    this.prevBtn = this.el.querySelector('[data-nav-prev]');
    this.nextBtn = this.el.querySelector('[data-nav-next]');

    this.activeIndex = index;
    this.pages = length;

    this.event();
  }

  event() {
    this.prevBtn.addEventListener('click', this.prev);
    this.nextBtn.addEventListener('click', this.next);
    this.prevBtn.addEventListener('touchstart', this.prev);
    this.nextBtn.addEventListener('touchstart', this.next);
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleTouchStart(evt) {
    if (this.animating) { return; }
    this.lastXDown = evt.touches[0].clientX;
  }

  handleTouchEnd() {
    if (this.animating || !this.lastXDown) { return; }

    const currentX = event.changedTouches[0].clientX;
    if (currentX > this.lastXDown  && this.activeIndex !== 0) {
      this.prev();
    } else if(currentX < this.lastXDown) {
      this.next();
    }

    this.lastXDown = null;
  }

  handleKeyDown(evt) {
    if (this.animating) { return; }

    if (evt.key == 'ArrowRight') {
      this.next();
    } else if(evt.key == 'ArrowLeft' && this.activeIndex !== 0) {
      this.prev();
    }
  }

  prev() {
    this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.pages - 1;
    this.moveToChapter();
    this.handleBtnVisibility();
  }

  next() {
    this.activeIndex = this.activeIndex < this.pages - 1 ? this.activeIndex + 1 : 0;
    this.moveToChapter();
    this.handleBtnVisibility();
  }

  moveToChapter() {
    this.animating = true;
    Transition.trigger();
    TextManager.update(this.activeIndex + 1);
    if (this.useGLCanvas) {
      Sketch.updateChapter(this.activeIndex);
    }
    Slider.update(this.activeIndex + 1);
    window.dispatchEvent(new CustomEvent('storybook_update', {detail: this.activeIndex + 1}));
  }

  handleBtnVisibility() {
    this.activeIndex == 0 ? this.prevBtn.classList.add('is-hidden') : this.prevBtn.classList.remove('is-hidden');
  }

  update(i) {
    this.activeIndex = i;
    window.dispatchEvent(new CustomEvent('storybook_update', {detail: this.activeIndex}));
  }
}

export default new Nav;