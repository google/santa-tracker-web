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
import Sketch from '../components/Sketch/Sketch.js';
import Nav from './Nav.js';
import Transition from '../components/Transition.js';
// console.log(Sketch)

class Slider {
  constructor() {
    this.handleSliderMouseDown = this.handleSliderMouseDown.bind(this);
    this.handleSliderMouseUp = this.handleSliderMouseUp.bind(this);
    this.handleSliderProgress = this.handleSliderProgress.bind(this);
    this.update = this.update.bind(this);
  }

  init(el, index, length, useGLCanvas) {
    this.container = el;
    this.useGLCanvas = useGLCanvas;

    this.activeIndex = index;
    this.pages = length;

    this.render();
    this.event();
  }

  event() {
    this.slider.addEventListener('keydown', e => {
      if (this.slider === document.activeElement) {
        e.preventDefault();
      }
    });

    this.slider.addEventListener('mousedown', this.handleSliderMouseDown);
    this.slider.addEventListener('touchstart', this.handleSliderMouseDown);
    this.slider.addEventListener('mouseup', this.handleSliderMouseUp);
    this.slider.addEventListener('touchend', this.handleSliderMouseUp);
    this.slider.addEventListener('input', this.handleSliderProgress);
  }

  handleSliderMouseDown() {
    Nav.animating = true;
    this.container.classList.add('is-grabbing');
  }

  handleSliderMouseUp() {
    Nav.animating = false;
    this.slider.blur();
    if(this.slider.value == this.activeIndex + 1) { return; }

    this.container.classList.remove('is-grabbing');
    Transition.trigger();
    TextManager.update(this.slider.value);
    if (this.useGLCanvas) {
      Sketch.updateChapter(this.slider.value - 1);
    }
    Nav.update(this.slider.value - 1);
    Nav.handleBtnVisibility();

    this.activeIndex = this.slider.value - 1;
  }

  handleSliderProgress() {
    this.slider.style.background = `linear-gradient(to right, #FFE14D 0%, #FFE14D ${this.slider.value / 22 * 100 - 1}%, #9FCEFF ${this.slider.value / 22 * 100 - 1}%, #9FCEFF 100%)`;
  }

  render() {
    this.container.innerHTML =
    `
    <input data-slider type="range" min="1" max="${this.pages}" steps="1" value="${this.activeIndex}">
    `
    this.slider = this.container.querySelector('[data-slider]');
  }

  update(i) {
    this.slider.value = i;
    this.activeIndex = this.slider.value - 1;
    this.handleSliderProgress();
  }
}

export default new Slider;