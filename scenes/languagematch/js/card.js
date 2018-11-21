goog.provide('Card');

/**
 * All the data associated with a card.
 * @export
 * @record
 */
var Card = class {

  constructor() {
    this.flipped = false;
    this.matched = false;
    /** Language that this card represents. Used for matching. */ 
    this.languageCode = false;
    this.content = '';
    /**
     * Language of the card's content. Translations are in the language of the
     * translation, but the language names are in the user's language.
     */
    this.contentLanguage = '';
    this.color = '';
  }

}