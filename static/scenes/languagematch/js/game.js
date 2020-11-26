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

goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.shared.LevelUp');
goog.require('app.shared.utils');
goog.require('Card');
goog.require('LevelModel');

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
    this.levelUp = new LevelUp(this, this.root.querySelector('.levelup'), this.root.querySelector('.levelup--number'));

    // Game information
    this.levels = [
      new LevelModel(2, true),
      new LevelModel(4, true),
      new LevelModel(8, true),
      new LevelModel(4, false),
      new LevelModel(12, true),
      new LevelModel(6, false),
      new LevelModel(16, true),
      new LevelModel(8, false),
      new LevelModel(12, false),
      new LevelModel(16, false),
    ]

    // Game state
    /** @private {number} Current level */
    this.levelIndex = 0;

    // Level information
    /** @private {!Array<!Card>} */
    this.cards = [];

    // Level state
    /** @private {!Array<!Card>} */
    this.flippedCards = [];
    /** @private {boolean} Whether all the cards have been matched or not. */
    this.levelWon = false;

    this.initLevel(this.levels[0]);
  }

  /**
   * @private
   * @param {!LevelModel} levelModel Information to create the level
   */
  initLevel(levelModel) {
    const numCards = levelModel.numCards;
    this.cards = levelModel.generateCards(this.root);

    this.createCards(numCards);
    this.initFlipAnimations();

    window.santaApp.fire('game-score', {level: this.levelIndex + 1, levels: this.levels.length});
  }

  /**
   * Adds card elements to the page.
   * @private
   * @param {Number} numCards Number of cards to add.
   */
  createCards(numCards) {
    const cards = this.root.querySelector('.cards');

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
   * Removes all the cards elements on a page.
   * @private
   */
  clearCards() {
    const cards = this.root.querySelector('.cards');

    while (cards.lastChild) {
      cards.removeChild(cards.lastChild);
    }
  }

  /**
   * @private
   */
  initFlipAnimations() {
    const cardElements = this.root.querySelectorAll('.card');
    for (const cardElement of cardElements) {
      cardElement.addEventListener('click', () => this.selectCard(cardElement));
    }
  }

  /**
   * Selects a card and checks if it matches.
   * @private
   * @param {!HTMLElement} cardElement Card selected
   */
  async selectCard(cardElement) {
    if (this.flippedCards.length >= 2) {
      // Too many cards flipped already.
      return;
    }
    if (this.levelWon) {
      // The game has been won and we're in the process of resetting.
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
    this.playSound(card.content, card.contentLanguage);

    if (this.flippedCards.length < 2) {
     // Not enough flipped cards, lets check for a match.
     return;
    }

    // Wait for the flip animation
    await this.waitForTransition(cardElement);

    // Check if the cards are a match.
    if (this.flippedCards[0].languageCode != this.flippedCards[1].languageCode) {
      // Not a match. Reset guess.

      // Pause for a bit so someone has time to process
      await this.waitForSeconds(0.5);
      await this.resetGuesses();
      return;
    }

    // Mark cards as matched.
    this.flippedCards.forEach(card => card.matched = true);
    // Clear the flipped cards so we can guess again.
    this.flippedCards = [];

    if (!this.cards.every(card => card.matched)) {
      // Still more cards to be matched
      return;
    }

    // They've won!
    this.levelWon = true;

    // TODO(jez): Use the common santa tracker level transition.

    // Pause for a bit so someone has time to process
    await this.waitForSeconds(0.5);

    // TODO: Possibly win the game here?

    // Start ending the level. Show the next level the user is about to play.
    this.levelUp.show((this.levelIndex + 1) + 1);
    await this.waitForTransition(this.levelUp.bgElem, 1);

    this.levelIndex++;
    // Switch to a new set of cards.
    this.clearCards();
    this.initLevel(this.levels[this.levelIndex]);
    // Allow the user to guess again.
    this.levelWon = false;
  }

  /**
   * Flips all unmatching cards to be facing down again.
   * @private
   */
  async resetGuesses() {
    const cardElements = this.root.querySelectorAll('.card');

    let animatingCard = null;

    for (let i = 0; i < this.cards.length; i ++) {
      const card = this.cards[i];
      const cardElement = cardElements[i];

      if (card.matched) { // Leave the matched cards as is.
        continue;
      }

      card.flipped = false;
      cardElement.classList.remove('flipped');

      // Save an arbitrary card so we can use it to wait for the animation to end.
      animatingCard = cardElement;
    }
    this.flippedCards = [];

    if (animatingCard === null) {
      return;
    }

    await this.waitForTransition(animatingCard);
    this.clearHiddenCardContents();
  }

  /**
   * Clears the content of all face-down cards
   * @private
   */
  clearHiddenCardContents() {
    const cardElements = this.root.querySelectorAll('.card');
    for (let i = 0; i < this.cards.length; i ++) {
      const card = this.cards[i];
      const cardElement = cardElements[i];

      if (!card.flipped) {
        this.clearCardContent(cardElement);
      }
    }
  }

  /**
   * Sets up the color and contents of a card element to match the underlying card object.
   * @private
   * @param {!HTMLElement} cardElement Card HTML element.
   * @param {!Card} card Underlying card object.
   */
  setCardContent(cardElement, card) {
    this.setCardColor(cardElement, card.backgroundColor, card.textColor);
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
    const contents = cardElement.querySelector('.card-contents');
    contents.textContent = text;
  }
  
  /**
   * Sets the face color of a card.
   * @private
   * @param {!HTMLElement} cardElement
   * @param {string} backgroundColor CSS color for the card background.
   * @param {string} textColor CSS color for the card text.
   */
  setCardColor(cardElement, backgroundColor, textColor) {
    const front = cardElement.querySelector('.card-front');
    front.style.backgroundColor = backgroundColor;
    front.style.color = textColor;
  }
  
  /**
   * @private
   * @param {string} text Text to play back
   * @param {?string} languageCode ISO language code
   */
  playSound(text, languageCode) {
    languageCode = languageCode || 'en';
    var url = app.Constants.TTS_DOMAIN + app.Constants.TTS_QUERY;
    url = window.encodeURI(url.replace('{TL}', languageCode).replace('{Q}', text));

    this.audio = new Audio(url);
    this.audio.play();
  }

  /**
   * Waits for a CSS transition to finish
   * @private
   * @param {!HTMLElement|!jQuery} element Element currently transitioning
   * @param {number=} timeout Fallback timeout in seconds.
   */
  async waitForTransition(element, timeout=1) {
    element = app.shared.utils.unwrapElement(element);

    await new Promise(r => {
      element.addEventListener('transitionend', r, {once: true});
      setTimeout(r, timeout * 1000)
    });
  }

  /**
   * Waits for a set amount of time
   * @private
   * @param {number} seconds Number of seconds to wait for
   */
  async waitForSeconds(seconds) {
    await new Promise(r => setTimeout(r, seconds * 1000));
  }

};

/**
 * @param {!HTMLElement} elem Element to find the position in the parent of.
 * @returns {number} The index of this element in it's parent.
 */
function getPositionInParent(elem) {
  const siblings = Array.from(elem.parentNode.children);
  return siblings.indexOf(elem);
}
