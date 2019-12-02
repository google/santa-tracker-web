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
