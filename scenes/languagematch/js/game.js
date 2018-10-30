goog.provide('app.Game');

goog.require('app.Constants');

app.Game = class Game {
  constructor(elem) {
    console.info(`Language game starting`);

    this.elem = elem;

    this.init();
  }

  init() {
    this.initFlipAnimations();
    this.initCardContents();
  }

  initFlipAnimations() {
    const cards = this.elem.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i ++) {
      const card = cards[i];
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      })
    }
  }

  initCardContents() {
    const cards = Array.from(this.elem.getElementsByClassName('card'));
    if (cards.length % 2 != 0) {
      console.error('Invalid number of cards!');
    }

    const translations = Object.entries(app.Constants.PHRASES[0]);

    const colors = app.Constants.COLORS.slice();

    while (cards.length > 0) {
      const color = removeRandom(colors);
      const translation = removeRandom(translations);

      const firstCard = removeRandom(cards);
      const secondCard = removeRandom(cards);
      setCardColor(firstCard, color);
      setCardColor(secondCard, color);

      setCardText(firstCard, translation[0]);
      setCardText(secondCard, translation[1]);
    }
  }

};

function setCardText(card, text) {
  const contents = card.getElementsByClassName('card-contents')[0];
  contents.textContent = text;
}

function setCardColor(card, color) {
  const front = card.getElementsByClassName('card-front')[0];
  front.style.backgroundColor = color;
}

// TODO(jez): Replace this with better random function?
function randomInteger(max) {
  return Math.floor(max * Math.random());
}

/**
 * Removes a random element from an array.
 * 
 * @param {Array<T>} arr Element to take from.
 * @returns {T} Element removed from array.
 */
function removeRandom(arr) {
  return arr.splice(randomInteger(arr.length), 1)[0];
}