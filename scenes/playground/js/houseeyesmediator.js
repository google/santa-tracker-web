goog.provide('app.HouseEyesMediator');

goog.require('app.Constants');

/**
 * Playground Scene class
 * Main class responsible for kicking off the scene
 * additional classes and elements.
 *
 * @param {Element} context An DOM element which wraps the scene.
 * @author  14islands (14islands.com)
 * @constructor
 */
app.HouseEyesMediator = function(context) {
  this.$context_ = $(context);
  this.houses = {};

  // Go!
  this.init_();
};

/**
 * Initializes the Scene by binding some events
 * @private
 */
app.HouseEyesMediator.prototype.init_ = function() {
  this.addEventListeners_();
};

/**
 * Stops the Briefing scene from running
 */
app.HouseEyesMediator.prototype.destroy = function() {
  this.houses = {};
  this.removeEventListeners_();
};

/**
 * Add listeners related to this context.
 * @private
 */
app.HouseEyesMediator.prototype.addEventListeners_ = function() {
  this.$context_.on('mousemove', this.onMouseMove.bind(this));
};

/**
 * Removes the listeners from this context.
 * @private
 */
app.HouseEyesMediator.prototype.removeEventListeners_ = function() {
  this.$context_.off('mousemove', this.onMouseMove.bind(this));
};

/**
 * Subscribe to this mediator to be able to receive published messages.
 *
 * @param  {String} key   Unique key name representing the "name" of this house.
 * @param  {Object} house House instance.
 */
app.HouseEyesMediator.prototype.subscribe = function(key, house) {
  if (house) {
    this.houses[key] = house;
    house.eyesMediator = this;
  }
};

/**
 * Unsubscribe to this mediator to no longer receive published messages.
 *
 * @param  {String} key Unique key name represending the "name" of this house.
 */
app.HouseEyesMediator.prototype.unsubscribe = function(key) {
  if (this.houses.hasOwnProperty(hey)) {
    delete this.houses[key];
  }
};

/**
 * Callback for when the mouse is moving.
 *
 * @param  {Obect} event Event object.
 */
app.HouseEyesMediator.prototype.onMouseMove = function(event) {
  var key = null;
  var mouse = {
    x: event.pageX,
    y: event.pageY
  };

  for (key in this.houses) {
    if (typeof this.houses[key].moveEyes === 'function') {
      this.houses[key].moveEyes(mouse);
    }
  }
};
