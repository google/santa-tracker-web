/**
 * @constructor
 */
var Cards = function (id, selector) {
  this.selector = selector;
  this.id = id;
  this.allCards = [];
  this.levelCards = [];
};

/**
 * Prepares the card deck
 * with all the possible card classes from the sprite.
 */
Cards.prototype.prepare = function() {
  // reset the array
  this.allCards.length = 0;
  for (var i = 1; i <= Constants.DOOR_COUNT; i++) {
    this.allCards.push( Constants.CLASS_FIGURE_PREFIX + i );
  };
};

/**
 * Generic shuffle function that shuffles an array.
 * @param {Array} cards The cards array to be shuffled.
 */
Cards.prototype.shuffle = function(cards) {
  var count = cards.length;
  for (var idx = 0; idx < count - 1; idx++) {
    var swap = idx + Math.floor(Math.random() * count - idx);
    var tmp = cards[idx];
    cards[idx] = cards[swap];
    cards[swap] = tmp;
  }
};

/**
 * Returns an array of card for a specific level
 * @param {Number} numberOfCards How many cards are we returning.
 */
Cards.prototype.getLevelCards = function(numberOfCards) {
  var _card = null;
  var i = null;
  var totalCards = Math.round(numberOfCards / 2);

  if (numberOfCards <= 0) {
    throw Error("Cards: invalid number of cards.");
    return;
  }

  // Shuffle the deck before picking cards
  this.shuffle( this.allCards );

  for (i = 0; i < totalCards; i++) {
    _card = this.allCards.pop();
    // push same card twice
    // because we need a combination of 2
    this.levelCards.push( _card );
    this.levelCards.push( _card );
  };

  // Shuffle our cards combination
  this.shuffle( this.levelCards );

  return this.levelCards;
}

