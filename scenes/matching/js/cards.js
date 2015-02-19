goog.provide('Cards');

/**
 * @param {string} id
 * @param {string} selector
 * @constructor
 */
var Cards = function(id, selector) {
  this.selector = selector;
  this.id = id;
  this.allCards = [];
};

/**
 * Prepares the card deck with all the possible card classes from the sprite.
 */
Cards.prototype.prepare = function() {
  // reset the array
  this.allCards.length = 0;
  for (var i = 1; i <= Constants.DOOR_COUNT; i++) {
    this.allCards.push(Constants.CLASS_FIGURE_PREFIX + i);
  }
};

/**
 * Returns an array of card for a specific level
 * @param {number} numberOfCards How many cards are we returning.
 * @return {!Array.<string>} array of classes to use to find cards
 */
Cards.prototype.getLevelCards = function(numberOfCards) {
  var card = null;
  var i;
  var totalCards = Math.round(numberOfCards / 2);

  if (numberOfCards <= 0) {
    throw Error('Cards: invalid number of cards.');
  }

  // Shuffle the deck before picking cards
  this.allCards = app.utils.shuffleArray(this.allCards);

  var levelCards = [];
  for (i = 0; i < totalCards; i++) {
    card = this.allCards.pop();
    // push same card twice
    // because we need a combination of 2
    levelCards.push(card);
    levelCards.push(card);
  }

  return levelCards;
};
