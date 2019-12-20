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