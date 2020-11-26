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

import { CHAPTERS } from '../model.js';

class TextManager {
  constructor() {
    this.container = document.querySelector('[data-scene]');
    this.active = 1;
    this.update = this.update.bind(this);

    this.appendChapters();
    this.update(this.active);
  }

  appendChapters() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < CHAPTERS.length; i++) {
      const chapter = document.createElement('div');
      chapter.className = 'scene__chapter';
      chapter.innerHTML =
      `
        <div class="scene__chapter-inner">
          ${CHAPTERS[i].text.map(item =>
            `
            <p class="scene__chapter-text">${item}</p>
            `
            ).join('')}
        </div>
      `;
      fragment.appendChild(chapter);
    }

    this.container.appendChild(fragment);
    this.chapters = this.container.querySelectorAll('.scene__chapter');
  }

  update(i) {
    this.chapters[this.active - 1].classList.remove('is-active');
    this.active = i;
    this.chapters[this.active - 1].classList.add('is-active');
  }
}

export default new TextManager();