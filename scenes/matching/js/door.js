goog.provide('Door');

/**
 * @param {string} id
 * @param {jQuery} $el
 * @param {function} clickHandler
 * @param {string} cardClass
 * @constructor
 */
var Door = function(id, $el, clickHandler, cardClass) {
  this.elem = $el;
  this.id = id;
  this.uniqueId = Door.ID_COUNTER++;
  this.isCompleted = false;
  this.isOpened = false;
  this.isMismatched = false;
  this.cardClass = cardClass;
  this.clickHandler = clickHandler;

  this.setCard();
  this.enable();

  this.attachEvents_();
};

/**
 * Unique id counter.
 * @type {number}
 */
Door.ID_COUNTER = 0;

/**
 * Attaches the click handler to the door.
 * @private
 */
Door.prototype.attachEvents_ = function() {
  this.elem.on('click', function() {
    this.clickHandler(this);
  }.bind(this));
};

/**
 * Removes the event handlers of the door;
 */
Door.prototype.destroy = function() {
  this.elem.off('click');
};

/**
 * Removes additional states or classes from a door
 * so it goes back to it's initial state.
 */
Door.prototype.reset = function() {

  if (this.isOpened) {
    this.close();
  }

  this.isCompleted = false;

  this.elem
    .find(Constants.SELECTOR_CARD)
    .attr('class', 'card');

  this.elem
    .attr('class', 'door')
    .off('click');
};

/**
 * Set the door to be closed.
 */
Door.prototype.close = function() {
  this.elem.removeClass(Constants.CLASS_DOOR_OPEN);
  this.isOpened = false;
  this.isMismatched = false;
};

/**
 * Set the door to be open.
 */
Door.prototype.open = function() {
  this.elem.addClass(Constants.CLASS_DOOR_OPEN);
  this.isOpened = true;
};

/**
 * Set the door to be either closed or opened
 * depending on it's state.
 */
Door.prototype.toggle = function() {
  if (this.isOpened) {
    this.close();
  } else {
    this.open();
  }
};

/**
 * Set a door to be completed (sed when a match is found).
 **/
Door.prototype.complete = function() {
  this.isCompleted = true;
  this.isMismatched = false;
};

/**
 * Returns if this door instance is completed (match found).
 * @return {boolean}
 */
Door.prototype.isCompleted = function() {
  return this.isCompleted;
};

/**
 * Returns the id of this door instance.
 * @return {string}
 */
Door.prototype.getId = function() {
  return this.id;
};

/**
 * Set a card background for this door
 * with a class.
 */
Door.prototype.setCard = function() {
  this.elem
    .find(Constants.SELECTOR_CARD)
    .addClass(this.cardClass);
};

/**
 * Enables the door to look playable (green).
 */
Door.prototype.enable = function() {
  this.elem
    .addClass(Constants.CLASS_DOOR_ENABLED);
};

/**
 * Disables the door to look unplayable (red).
 */
Door.prototype.disable = function() {
  this.elem
    .removeClass(Constants.CLASS_DOOR_ENABLED);
};

