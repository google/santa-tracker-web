goog.provide('app.Lights');

/**
 * Lighting interactions
 *
 * @param {!Element} elem A DOM element which wraps the game.
 * @constructor
 */
app.Lights = function(elem) {
  var lights = elem.find('.Lights');
  this.floorLights = lights.find('.Light-floor');
  this.ceilingLights = lights.find('.Light-ceiling');

  var triggerLights = function(condition, light, className) {
    condition ? light.addClass(className) : light.removeClass(className);
  };

  elem.on('stagechanged.jamband', function(e, data) {
    var count = data.count;
    triggerLights(count > 0, this.ceilingLights, 'Light-ceiling--on');
    triggerLights(count > 2, this.floorLights, 'Light-floor--on');
    triggerLights(count > 3, this.floorLights, 'animate');
    triggerLights(count > 4, this.floorLights, 'Light-colored--on');
    triggerLights(count > 5, this.ceilingLights, 'Light-colored--on');
  }.bind(this));
};
