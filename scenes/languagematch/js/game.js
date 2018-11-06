goog.provide('app.Game');

goog.require('app.Constants');
goog.require('Card');

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

    // Level state things
    /** @type Array<Card> */
    this.cards = [];

    // State variables
    this.numberOfFlippedCards = 0;
    /** @type Array<Card> */
    this.flippedCards = [];

    this.init();
  }

  /**
   * @private
   */
  init() {
    this.initCards();
    this.initFlipAnimations();
  }

  /**
   * Sets up the underlying data for this game.
   * @private
   */
  initCards() {
    const cardElements = Array.from(this.root.getElementsByClassName('card'));
    if (cardElements.length % 2 != 0) {
      console.error('Invalid number of cards!');
    }

    const translations = Object.entries(app.Constants.PHRASES[0]);
    const colors = app.Constants.COLORS.slice();

    const cards = [];
    for (let i = 0; i < cardElements.length / 2; i ++) {
      const color = removeRandom(colors);
      const translation = removeRandom(translations);
      const languageCode = translation[0];
      const message = translation[1];
      const languageName = this.getLanguageName(languageCode);

      const languageCard = new Card();
      languageCard.languageCode = languageCode;
      languageCard.content = message;
      languageCard.contentLanguage = languageCode;
      languageCard.color = color;
      cards.push(languageCard);

      const translationCard = new Card();
      translationCard.languageCode = languageCode;
      translationCard.content = languageName;
      // This is in the user's language.
      // TODO(jez): Make this not just English.
      translationCard.contentLanguage = 'en';
      translationCard.color = color;
      cards.push(translationCard);
    }

    const shuffledCards = [];
    while (cards.length > 0) {
      shuffledCards.push(removeRandom(cards));
    }

    this.cards = shuffledCards;
  }

  /**
   * @private
   */
  initFlipAnimations() {
    const cardElements = this.root.getElementsByClassName('card');
    for (const cardElement of cardElements) {
      cardElement.addEventListener('click', () => {
        if (this.flippedCards.length >= 2) {
          // Too many cards flipped already.
          return;
        }
        // Get the data associated with this card.
        const cardIndex = getPositionInParent(cardElement);
        const card = this.cards[cardIndex];

        if (card.flipped) {
          // Card is already flipped.
          return;
        }

        this.setCardContent(cardElement, card);

        cardElement.classList.add('flipped');
        card.flipped = true;

        this.flippedCards.push(card);
        this.playSound("hello");

        if (this.flippedCards.length >= 2) {
          // Check if the cards are a match.
          if (this.flippedCards[0].languageCode == this.flippedCards[1].languageCode) {
            console.log(`It's a match?`)
            this.flippedCards.forEach(card => card.matched = true);
          }
          // TODO(jez): Resolve timing issues when flipping multiple cards.
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
    const cardElements = this.root.getElementsByClassName('card');
    for (let i = 0; i < this.cards.length; i ++) {
      const card = this.cards[i];
      const cardElement = cardElements[i];

      if (card.matched) { // Leave the matched cards as is.
        continue;
      }
      
      card.flipped = false;
      cardElement.classList.remove('flipped');
      // TODO(jez): Don't clear the card here, but only when it's stopped flipping.
      this.clearCardContent(cardElement);
    }
    this.flippedCards = [];
  }

  /**
   * Sets up the color and contents of a card element to match the underlying card object.
   * @private
   * @param {!HTMLElement} cardElement Card HTML element.
   * @param {Card} card Underlying card object. 
   */
  setCardContent(cardElement, card) {
    this.setCardColor(cardElement, card.color);
    this.setCardText(cardElement, card.content);
  }

  /**
   * Clears the style of a card element (so you can't cheat by looking at the HTML to see what it is).
   * @private
   * @param {!HTMLElement} cardElement Card HTML element.
   */
  clearCardContent(cardElement) {
    this.setCardColor(cardElement, 'white');
    this.setCardText(cardElement, '');
  }

  /**
   * Sets the content of a card.
   * @private
   * @param {!HTMLElement} cardElement
   * @param {string} text Text to display on the card.
   */
  setCardText(cardElement, text) {
    const contents = cardElement.getElementsByClassName('card-contents')[0];
    contents.textContent = text;
  }
  
  /**
   * Sets the face color of a card.
   * @private
   * @param {!HTMLElement} cardElement
   * @param {string} color CSS color for the card background.
   */
  setCardColor(cardElement, color) {
    const front = cardElement.getElementsByClassName('card-front')[0];
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
 * @param {Array<T>} arr Array to take from.
 * @returns {T} Element removed from array.
 */
function removeRandom(arr) {
  return arr.splice(randomInteger(arr.length), 1)[0];
}

/**
 * @param {!HTMLElement} elem Element to find the position in the parent of.
 * @returns {number} The index of this element in it's parent.
 */
function getPositionInParent(elem) {
  const siblings = Array.from(elem.parentNode.children);
  return siblings.indexOf(elem);
}