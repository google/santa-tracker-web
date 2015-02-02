goog.provide('app.Elevator');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 *
 * Class responsible for handling the Elevator interactions.
 *
 * @param {!Element} context Module context in a HTML element*
 * @constructor
 */
app.Elevator = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$button = this.$context_.find('.js-elevator-button');
  this.$characters = this.$context_.find('.js-elevator-character');
  this.$penguin = this.$characters.filter('.js-elevator-character-penguin');
  this.$deer = this.$characters.filter('.js-elevator-character-deer');
  this.$snowman = this.$characters.filter('.js-elevator-character-snowman');
  this.$activeButton = null;
  this.isBusy = false;
  this.showCount = 0;

  this.charactersSet = {
    0: [this.$penguin],
    1: [this.$penguin, this.$snowman],
    2: [this.$penguin, this.$snowman, this.$deer]
  };
  this.randomCharactersSet = {
    0: [this.$penguin, this.$snowman],
    1: [this.$penguin, this.$deer],
    2: [this.$penguin, this.$snowman, this.$deer],
    3: [this.$deer, this.$snowman]
  };

  this.onButtonClick_ = this.onButtonClick_.bind(this)
};

/**
 * Initializes the class.
 */
app.Elevator.prototype.init = function() {
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Elevator.prototype.destroy = function() {
  this.removeEventListeners_();
  this.isBusy = false;
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Elevator.prototype.addEventListeners_ = function() {
  this.$button.on('click', this.onButtonClick_);
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Elevator.prototype.removeEventListeners_ = function() {
  this.$button.off('click', this.onButtonClick_);
};

/**
 * Callback for when an elevator button is clicked.
 *
 * @private
 * @param {Event} event Event object
 */
app.Elevator.prototype.onButtonClick_ = function(event) {
  if (this.isBusy) return;
  this.isBusy = true;

  this.$activeButton = $(event.currentTarget);

  // Set button active
  this.$activeButton.addClass(app.Constants.CLASS_ACTIVE_BUTTON);

  // Call the lift
  this.callElevator_();

  window.santaApp.fire('sound-trigger', 'briefing_elevator_button');
};

/**
 * Makes a set of characters visible based on randomness.
 *
 * @private
 */
app.Elevator.prototype.showCharacters_ = function() {
  var characters = this.getCharacters_();
  characters.forEach(function(c) {
    c.addClass(app.Constants.CLASS_ACTIVE_CHARACTER);
  });
};

/**
 * Gets a set of characters.
 *
 * The elevator will show the
 * characters in order first, before
 * randomizing it:
 *
 * - penguin
 * - penguin + snowman
 * - penguin + snowman + deer
 * - random
 * - random
 * - etc ...
 *
 * @private
 * @return {Array} Array of characters to be displayed.
 */
app.Elevator.prototype.getCharacters_ = function() {

  var $charactersArr = [];

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Are we still trying to show all the characters?
  if (this.showCount < app.Constants.NUM_OF_CHARACTERS) {

    $charactersArr = this.charactersSet[this.showCount];
    this.showCount++;

  } else {

    // Get a random set of indexes
    $charactersArr = this.randomCharactersSet[getRandomInt(0, app.Constants.LAST_SET_INDEX)];

  }

  return $charactersArr;

};

/**
 * Closes the elevator functionality.
 *
 * @private
 */
app.Elevator.prototype.closeElevator_ = function() {

  // Stop animating
  this.$context_
    .removeClass(app.Constants.CLASS_INCOMING_ELEVATOR)
    .removeClass(app.Constants.CLASS_OPENED_ELEVATOR);

  // Set the button to it's inactive state (greyed out)
  this.$activeButton
    .removeClass(app.Constants.CLASS_ACTIVE_BUTTON);

  // Hide all characters
  this.$characters
    .removeClass(app.Constants.CLASS_ACTIVE_CHARACTER);

  // Available for another call
  this.isBusy = false;
};

/**
 * Sets the characters as active/visible in the elevator
 * allowing them to animate (blinking eyes).
 * This is called for when the elevator has the doors opened.
 *
 * @private
 */
app.Elevator.prototype.activateCharacters_ = function() {
  this.$context_
    .addClass(app.Constants.CLASS_OPENED_ELEVATOR);
};

/**
 * Calls the elevator by animating it
 * and prepares the callbacks.
 *
 * @private
 */
app.Elevator.prototype.callElevator_ = function() {

  // Randomize which characters are to be shown
  this.showCharacters_();

  // Animate the elevator
  this.$context_
    .addClass(app.Constants.CLASS_INCOMING_ELEVATOR);

  setTimeout(function() {
    window.santaApp.fire('sound-trigger', 'briefing_elevator_open');
  }, app.Constants.ELEVATOR_UNTIL_DOOR_OPENS_MS);

  // Animate the characters inside when the door is open
  setTimeout(this.activateCharacters_.bind(this), app.Constants.ELEVATOR_DOOR_OPENED_MS);

  setTimeout(function() {
    window.santaApp.fire('sound-trigger', 'briefing_elevator_close');
  }, app.Constants.ELEVATOR_UNTIL_DOOR_CLOSES_MS);

  // Close after animation duration is complete
  setTimeout(this.closeElevator_.bind(this), app.Constants.ELEVATOR_ANIMATION_DURATION_MS);

};
