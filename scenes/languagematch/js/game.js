goog.provide('app.Game');

goog.require('app.Constants');

/**
 * Runs the language matching card game.
 * @export
 */
app.Game = class Game {

  /**
   * @param {!HTMLElement} elem Root element of the game (not necessarily of the window).
   */
  constructor(elem) {
    console.info(`Language game starting`);

    this.root = elem.getRootNode();

    // state variables
    this.numberOfFlippedCards = 0;

    this.init();
  }

  /**
   * @private
   */
  init() {
    // TODO(jez): Dynamically pick the number of cards to use.
    this.createCards(16);
    this.initFlipAnimations();
    this.initCardContents();
  }

  /**
   * Adds card elements to the page.
   * @private
   * @param {Number} numCards Number of cards to add.
   */
  createCards(numCards) {
    const cards = document.getElementsByClassName('cards')[0];

    for (let i = 0; i < numCards; i ++) {
      const card = document.createElement('div');
      card.classList.add('card');
      cards.appendChild(card);

      const cardFront = document.createElement('div');
      cardFront.classList.add('card-front');
      card.appendChild(cardFront);

      const cardContents = document.createElement('div');
      cardContents.classList.add('card-contents');
      cardFront.appendChild(cardContents);

      const cardBack = document.createElement('div');
      cardBack.classList.add('card-back');
      card.appendChild(cardBack);
    }
  }

  /**
   * @private
   */
  initFlipAnimations() {
    const cards = this.root.getElementsByClassName('card');
    for (const card of cards) {
      card.addEventListener('click', () => {
        if (this.numberOfFlippedCards >= 2) {
          // Too many cards flipped already.
          return;
        }
        if (card.classList.contains('flipped')) {
          // Card is already flipped.
          return;
        }

        card.classList.add('flipped');
        this.numberOfFlippedCards ++;
        this.playSound("hello");

        if (this.numberOfFlippedCards >= 2) {
          setTimeout(() => this.resetCards(), 1000);
        }
      });
    }
  }

  /**
   * Flips all the cards to be facing down again.
   * @private
   */
  resetCards() {
    const cards = this.root.getElementsByClassName('card');
    for (const card of cards) {
      card.classList.remove('flipped');
    }
    this.numberOfFlippedCards = 0;
  }

  /**
   * Sets up the color and contents of all the cards.
   * TODO(jez): Only do this when the card is flipped so people can't easily cheat?
   * @private
   */
  initCardContents() {
    const cards = Array.from(this.root.getElementsByClassName('card'));
    if ((cards.length % 2) != 0) {
      console.error('Invalid number of cards!');
    }

    const translations = Object.entries(app.Constants.PHRASES[0]);

    const colors = app.Constants.COLORS.slice();

    while (cards.length > 0) {
      const color = removeRandom(colors);
      const translation = removeRandom(translations);
      const languageCode = translation[0];
      const message = translation[1];
      const languageName = this.getLanguageName(languageCode);

      const firstCard = removeRandom(cards);
      const secondCard = removeRandom(cards);
      this.setCardColor(firstCard, color);
      this.setCardColor(secondCard, color);

      this.setCardText(firstCard, languageName);
      this.setCardText(secondCard, message);
    }
  }

  /**
   * Sets the content of a card.
   * @private
   * @param {!HTMLElement} card
   * @param {string} text Text to display on the card.
   */
  setCardText(card, text) {
    const contents = card.getElementsByClassName('card-contents')[0];
    contents.textContent = text;
  }
  
  /**
   * Sets the face color of a card.
   * @private
   * @param {!HTMLElement} card
   * @param {string} color CSS color for the card background.
   */
  setCardColor(card, color) {
    const front = card.getElementsByClassName('card-front')[0];
    front.style.backgroundColor = color;
  }
  
  /**
   * Gets a language name in the user's local language.
   *
   * Implicitely relies on the inbuilt translation that happens for the page contents.
   * @private
   * @param {string} code Language code of the language to get the name of (not the user's language).
   * @returns {string} Language name in user's language (e.g. 'Spanish' for 'es' if the user's language is 'en').
   */
  getLanguageName(code) {
    const id = code + '_language_name';
    return this.root.getElementById(id).textContent;
  }

  /**
   * @private
   * @param {string} text Text to play back
   * @param {?string} languageCode ISO language code
   */
  playSound(text, languageCode) {
    languageCode = languageCode || 'en';
    var url = app.Constants.TTS_DOMAIN + app.Constants.TTS_QUERY;
    url = encodeURI(url.replace('{TL}', languageCode).replace('{Q}', text));

    this.audio = new Audio(url);
    this.audio.play();
  }

};

// TODO(jez): Replace this with better random function?
/**
 * Picks a random integer between 0 (inclusive) and max (exclusive).
 * @param {number} max Exclusive maximum.
 */
function randomInteger(max) {
  return Math.floor(max * Math.random());
}

/**
 * Removes a random element from an array.
 * 
 * @param {!Array<T>} arr Element to take from.
 * @returns {T} Element removed from array.
 * @template T
 */
function removeRandom(arr) {
  return arr.splice(randomInteger(arr.length), 1)[0];
}