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

import {models, cta, ageLabel} from '../js/strings.js';
import {href} from '../../../src/scene/route.js';
import {_static} from '../../../src/magic.js';

class Accordion {
  constructor(el) {
    this.el = el;
    this.dom();
    this.appendCards();
  }

  dom() {
    this.cards_container = this.el.querySelector('.accordion__content')
  }

  _renderItem(item) {
    const rawHref = item.href || `${item.id}.html` || '#';
    const safeHref = href(rawHref);  // rectify for prod domain
    const imageBase = _static`img/scenes/` + item.id;

    return `
<div class="accordion__card">
  <a href="${safeHref}" ${item.href ? `target="_blank"` : ''}>
    <div class="card__upper">
      <img src="${imageBase}_2x.png" srcset="${imageBase}_2x.png 2x, ${imageBase}_1x.png 1x" loading="lazy" />
    </div>
    <div class="card__text">
      <h5 class="card__title">${item.title}</h5>
      <div class="card__age">${ageLabel}</div>
      <div class="card__desc">${item.body}</div>
      <div class="card__cta">${cta}</div>
    </div>
  </a>
</div>
`;
  }

  appendCards() {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < models.length; i++) {
      const group = document.createElement('div');
      group.className = 'accordion__content-block';
      if (models[i].id) {
        group.id = models[i].id;
      }
      group.innerHTML = `
<div class="accordion__info">
  <h5 class="accordion__info-title">${models[i].heading.title}</h5>
  <p class="accordion__info-body">${models[i].heading.body}</p>
</div>
<div class="accordion__cards">
${models[i].cards.map((item) => this._renderItem(item)).join('')}
</div>
      `;
      fragment.appendChild(group);
    }

    this.cards_container.appendChild(fragment);
  }
}

export default Accordion;
