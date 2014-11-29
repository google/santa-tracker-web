goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.House');
goog.require('app.HouseColorMediator');
goog.require('app.HouseEyesMediator');

/**
 * Playground Scene class
 * Main class responsible for kicking off the scene
 * additional classes and elements.
 *
 * @param {Element} context An DOM element which wraps the scene.
 * @author  14islands (14islands.com)
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];

  this.houses = [];
  this.$houses = this.$context_.find(app.Constants.HOUSE_CSS_SELECTOR);

  // Go!
  this.init_();
};

/**
 * Initializes the Scene by biding some events
 * @private
 */
app.Scene.prototype.init_ = function() {
  var i = 0;
  var house = null;
  var $house = null;

  this.colorMediator = new app.HouseColorMediator();
  this.eyesMediator = new app.HouseEyesMediator(this.$context_);

  this.numHouses = this.$houses.length;

  for (i = 0; i < this.numHouses; i++) {
    $house = this.$houses.eq(i);
    house = new app.House($house);
    this.houses.push(house);
    this.colorMediator.subscribe('house' + i, house);
    this.eyesMediator.subscribe('house' + i, house);
  }
};

/**
 * Stops the Briefing scene from running
 * @export
 */
app.Scene.prototype.destroy = function() {
  var i = 0;

  this.colorMediator.destroy();
  this.eyesMediator.destroy();

  for (i = 0; i < this.numHouses; i++) {
    this.houses[i].destroy();
  }
};
