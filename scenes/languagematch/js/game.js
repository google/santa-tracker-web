goog.provide('app.Game');

goog.require('app.Constants');

/**
 * @export
 */
app.Game = class Game {
  constructor(elem) {
    console.info(`Language game starting`);

    this.root = elem.getRootNode();

    this.init();
  }

  init() {
    this.initFlipAnimations();
    this.initCardContents();
  }

  initFlipAnimations() {
    const cards = this.root.getElementsByClassName('card');
    for (const card of cards) {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        this.playSound("hello");
      });
    }
  }

  initCardContents() {
    const cards = Array.from(this.root.getElementsByClassName('card'));
    if (cards.length % 2 != 0) {
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

  setCardText(card, text) {
    const contents = card.getElementsByClassName('card-contents')[0];
    contents.textContent = text;
  }
  
  setCardColor(card, color) {
    const front = card.getElementsByClassName('card-front')[0];
    front.style.backgroundColor = color;
  }
  
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