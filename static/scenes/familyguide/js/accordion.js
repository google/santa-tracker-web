import { models, cta, ageLabel } from '../js/strings.js';

class Accordion {
  constructor(el) {
    this.el = el
    this.dom()
    this.appendCards()
  }

  dom() {
    this.cards_container = this.el.querySelector('.accordion__content')
  }

  appendCards() {
    const _fragment = document.createDocumentFragment()
    for (let i = 0; i < models.length; i++) {
      const group = document.createElement('div')
      group.className = 'accordion__content-block'
      if (models[i].id) {
        group.id = models[i].id
      }
      group.innerHTML =
      `
      <div class="accordion__info">
        <h5 class="accordion__info-title">${models[i].heading.title}</h5>
        <p class="accordion__info-body">${models[i].heading.body}</p>
      </div>
      <div class="accordion__cards">
      ${models[i].cards.map(item => `
        <div class="accordion__card">
          <a href="${item.href}" ${item.external ? `target="_blank"` : ''}>
            <div class="card__upper">
              <img src="${item.image}" loading="lazy">
            </div>
            <div class="card__text">
              <h5 class="card__title">${item.title}</h5>
              <div class="card__age">${ageLabel}</div>
              <div class="card__desc">${item.body}</div>
              <div class="card__cta">${cta}</div>
            </div>
          </a>
        </div>
      `).join('')}
      </div>
      `
      _fragment.appendChild(group)
    }

    this.cards_container.appendChild(_fragment)
  }
}

export default Accordion