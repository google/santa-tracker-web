goog.provide('app.HouseColorMediator');

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
app.HouseColorMediator = function(context) {
  this.houses = {};
};

/**
 * Stops the Briefing scene from running
 */
app.HouseColorMediator.prototype.destroy = function() {
  this.houses = {};
};

/**
 * Subscribe to this mediator to be able to receive published messages.
 *
 * @param  {String} key   Unique key name representing the "name" of this house.
 * @param  {Object} house House instance.
 */
app.HouseColorMediator.prototype.subscribe = function(key, house) {
  if (house) {
    this.houses[key] = house;
    house.colorMediator = this;
  }
};

/**
 * Unsubscribe to this mediator to no longer receive published messages.
 *
 * @param  {String} key Unique key name represending the "name" of this house.
 */
app.HouseColorMediator.prototype.unsubscribe = function(key) {
  if (this.houses.hasOwnProperty(hey)) {
    delete this.houses[key];
  }

};

/**
 * Broadcasts a message to all objects subscribed to this mediator.
 *
 * @param  {String} color The color that it needs to change to.
 * @param  {[type]} from  The subject that is broadcasting this.
 */
app.HouseColorMediator.prototype.publish = function(color, from) {
  var key = null;
  for (key in this.houses) {
    if (typeof this.houses[key].changeColor === 'function') {
      this.houses[key].changeColor(color, from);
    }
  }
};
