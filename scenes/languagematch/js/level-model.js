goog.provide('LevelModel');

goog.require('app.Constants');

  /**
   * @export
   */
const LevelModel = class LevelModel {
  
  /**
   * Represents the information of one particular level
   * @param {number} numCards Number of cards. Must be divisible by 2.
   * @param {boolean} showColors Whether to color the face of the cards or not.
   */
 constructor(numCards, showColors) {
    this.numCards = numCards;
    this.showColors = showColors;
  }

  /**
   * Generates one set of cards for this level
   * @param {!HTMLElement} root Game root
   * @public
   */
  generateCards(root) {
    const translations = Object.entries(app.Constants.PHRASES['Season\'s Greetings']);
    const colors = app.Constants.COLORS.slice();

    const cards = [];
    for (let i = 0; i < this.numCards / 2; i ++) {
      let backgroundColor = 'white';
      let textColor = 'black';
      if (this.showColors) {
        backgroundColor = removeRandom(colors);
        textColor = 'white';
      }

      const translation = removeRandom(translations);
      const languageCode = translation[0];
      const message = translation[1];
      const languageName = app.Constants.LANGUAGE_NAMES[languageCode];

      const languageCard = new Card();
      languageCard.languageCode = languageCode;
      languageCard.content = message;
      languageCard.contentLanguage = languageCode;
      languageCard.backgroundColor = backgroundColor;
      languageCard.textColor = textColor;
      cards.push(languageCard);

      const translationCard = new Card();
      translationCard.languageCode = languageCode;
      translationCard.content = languageName;
      // This is in the user's language.
      // TODO(jez): Make this not just English.
      translationCard.contentLanguage = document.documentElement.lang || 'en';
      translationCard.backgroundColor = backgroundColor;
      translationCard.textColor = textColor;
      cards.push(translationCard);
    }

    const shuffledCards = [];
    while (cards.length > 0) {
      shuffledCards.push(removeRandom(cards));
    }

    return shuffledCards;
  }
}

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
 * @param {!Array<T>} arr Array to take from.
 * @returns {T} Element removed from array.
 * @template T
 */
function removeRandom(arr) {
  return arr.splice(randomInteger(arr.length), 1)[0];
}
