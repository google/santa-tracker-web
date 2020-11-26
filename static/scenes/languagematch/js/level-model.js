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
      const languageName = this.getLanguageName(root, languageCode);

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

  /**
   * Gets a language name in the user's local language.
   *
   * Implicitely relies on the inbuilt translation that happens for the page contents.
   * @private
   * @param {!HTMLElement} root Game root
   * @param {string} code Language code of the language to get the name of (not the user's language).
   * @returns {string} Language name in user's language (e.g. 'Spanish' for 'es' if the user's language is 'en').
   */
  getLanguageName(root, code) {
    const id = 'lang-' + code;
    return root.getElementById(id).textContent;
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
