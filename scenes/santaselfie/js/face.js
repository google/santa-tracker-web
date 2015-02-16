goog.provide('app.Face');

goog.require('app.utils');



/**
 * Interactions for Santa's face
 * @constructor
 * @extends {app.GameObject}
 * @param {!jQuery} $elem The container element
 */
app.Face = function($elem) {
  this.eyes = $elem.find('.eye');
  this.eyebrows = $elem.find('.eyebrow');
  this.nose = $elem.find('.nose');
  this.face = $elem.find('.Face');
};


/**
 * @extends {app.GameObject.start}
 */
app.Face.prototype.start = function() {
  function blink() {
    this.eyes.each(function(index, eye) {
      $(eye).addClass('eye--blink');

      window.setTimeout(function() {
        $(eye).removeClass('eye--blink');
      }, 200);
    }, this);
  }

  app.utils.randomLoop(blink.bind(this), 1000, 8000);
  game.mouse.subscribe(this.mouseChanged, this);
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {!app.Mouse} mouse
 */
app.Face.prototype.mouseChanged = function(mouse) {
  function transform(element, x, y) {
    element.css({
      'transform': 'translate3d(' + x + 'em, ' + y + 'em, 0)'
    });
  }

  function nearNose(distance) {
    var rect = this.nose[0].getBoundingClientRect();

    var centerX = (rect.left + rect.right) / 2;
    var centerY = (rect.top + rect.bottom) / 2;
    var differenceX = mouse.x - centerX;
    var differenceY = mouse.y - 86 - centerY;

    return Math.sqrt(differenceX * differenceX + differenceY * differenceY) < distance;
  }

  var EYE_MOVEMENT_X = 10;
  var EYE_MOVEMENT_Y = 5;

  transform(this.eyes, mouse.relX * EYE_MOVEMENT_X, mouse.relY * EYE_MOVEMENT_Y);
  transform(this.eyebrows, 0, mouse.relY * EYE_MOVEMENT_Y);
  transform(this.face, mouse.relX * EYE_MOVEMENT_X, mouse.relY * EYE_MOVEMENT_Y);

  this.face.toggleClass('Face--hairdryerLeft',
      game.tools.hairdryer.isSelected && mouse.down && mouse.relX < -0.3);
  this.face.toggleClass('Face--hairdryerRight',
      game.tools.hairdryer.isSelected && mouse.down && mouse.relX > 0.3);
  this.face.toggleClass('Face--hairdryerCenter',
      game.tools.hairdryer.isSelected && mouse.down && Math.abs(mouse.relX) < 0.3);
  this.face.toggleClass('Face--alarmed',
      game.tools.clipper.isSelected);
  this.face.toggleClass('Face--shaving',
      game.tools.clipper.isSelected && mouse.down && nearNose.call(this, 120));
};
