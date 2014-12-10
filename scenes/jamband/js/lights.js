goog.provide('app.Lights');



/**
 * Lighting interactions
 * @param {Element} elem A DOM element which wraps the game.
 * @constructor
 */
app.Lights = function(elem) {
  var lights = elem.find('.Lights');
  this.floorLights = lights.find('.Light-floor');
  this.ceilingLights = lights.find('.Light-ceiling');

  var triggerLights = function(condition, light, className) {
    condition ? light.addClass(className) : light.removeClass(className);
  };

  var self = this;
  elem.on('stagechanged.jamband', function(e, data) {
    var count = data.count;
    triggerLights(count > 0, self.ceilingLights, 'Light-ceiling--on');
    triggerLights(count > 2, self.floorLights, 'Light-floor--on');
    triggerLights(count > 3, self.floorLights, 'animate');
    triggerLights(count > 4, self.floorLights, 'Light-colored--on');
    triggerLights(count > 5, self.ceilingLights, 'Light-colored--on');
  });
};


app.Lights.prototype.animate = function(lights) {
  lights.addClass('animate');
};


app.Lights.prototype.stop = function(lights) {
  lights.removeClass('animate');
};
