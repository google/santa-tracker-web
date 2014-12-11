goog.provide('app.Tools');

goog.require('app.utils');



/**
 * Base tool item
 * @constructor
 * @extends {app.GameObject}
 * @param {string} name The name of the tool.
 * Element should have class Tool-name.
 * @param {{x: number, y: number}} mouseOffset Tool offset relative to the mouse
 */
app.Tool = function(name, mouseOffset) {
  this.el = this.elem.find('.Tool-' + name);
  this.container = this.el.closest('.Tool-container');
  this.isSelected = false;
  this.mouseOffset = mouseOffset || {x: 0, y: 0};
  this.animationEl = null;
  this.animateInfinitely = false;
  this.animationPlayer = null;
  this.isAnimating = false;

  // Polyfill pointer-events: none for IE 10
  var pointerEventsNone = function(e) {
    var origDisplayAttribute = $(this).css('display');
    $(this).css('display', 'none');

    var underneathElem = document.elementFromPoint(e.clientX, e.clientY);

    if (origDisplayAttribute) {
      $(this).css('display', origDisplayAttribute);
    } else {
      $(this).css('display', '');
    }

    // fire the mouse event on the element below
    e.target = underneathElem;
    $(underneathElem).trigger(e);

    e.stopPropagation();
  };

  this.el.on('click touchend', pointerEventsNone);

  this.initAnimation_();
};


/**
 * Select this tool from the toolbox
 */
app.Tool.prototype.select = function() {
  this.isSelected = true;

  this.el.addClass('Tool--selected');
  this.width = this.el.width();

  if (!Modernizr.touch) {
    this.elem.css({ cursor: 'none' });
  }

  if (this === game.tools.clipper) {
    window.santaApp.fire('sound-trigger', 'selfie_concerned');
  }

  this.move(game.mouse);
  window.santaApp.fire('sound-trigger', 'selfie_click');
};


/**
 * Deselect this tool
 */
app.Tool.prototype.deselect = function() {
  this.isSelected = false;

  if (this === game.tools.clipper) {
    window.santaApp.fire('sound-trigger', 'selfie_happy');
  }

  this.el.removeClass('Tool--selected');
  this.el.css({
    top: '',
    left: ''
  });
  this.elem.css({
    cursor: ''
  });
};


/**
 * Move the tool to the specified mouse position
 * @param {app.Mouse} mouse Game mouse object
 */
app.Tool.prototype.move = function(mouse) {
  var offsetX = this.mouseOffset.x;

  if (mouse.relX > 0 && (this === game.tools.hairgrow || this === game.tools.hairclean)) {
    offsetX = this.width - this.mouseOffset.x;
  }

  this.el.css({
    left: mouse.x - offsetX,
    top: mouse.y - this.mouseOffset.y
  });

  var shouldAnimate = this.shouldAnimate_(mouse);
  if (shouldAnimate === this.isAnimating) {
    return;
  }
  this.isAnimating = shouldAnimate;
  if (this.isAnimating) {
    this.animationEl.show();

    this.animationPlayer.currentTime = 0;
    this.animationPlayer.play();
  } else {
    if (this.animateInfinitely) {
      this.animationEl.hide();
      this.animationPlayer.pause();
    }
  }
};


/**
 * Initializes the optional animation for when the tool is used.
 * @private
 */
app.Tool.prototype.initAnimation_ = function() {
  if (this.el.find('.Tool-animation').length) {
    this.animationEl = this.el.find('.Tool-animation');
  }

  var animation = this.createAnimation_();
  if (!animation) {
    return;
  }

  this.animateInfinitely = animation.timing.iterations === Infinity;
  this.animationPlayer = document.timeline.play(animation);
  this.animationPlayer.pause();
};


/**
 * Should be subclassed to create a web Animation instance for the tool effect.
 * @return {Animation}
 * @private
 */
app.Tool.prototype.createAnimation_ = function() {
  return null;
};


/**
 * Evaluate if the tool should play its animation.
 * @param {app.Mouse.transformCoordinates} mouse info.
 * @return {boolean}
 * @private
 */
app.Tool.prototype.shouldAnimate_ = function(mouse) {
  return this.animationPlayer && mouse.down && mouse.x > 230;
};



/**
 * Clipper tool.
 * @constructor
 */
app.Clipper = function() {
  app.Tool.call(this, 'clipper', {x: 40, y: 0});
};
goog.inherits(app.Clipper, app.Tool);


/**
 * Creates a web animation for using the clippers.
 * @return {Animation}
 * @private
 */
app.Clipper.prototype.createAnimation_ = function() {
  return new Animation(this.animationEl[0], [
    {backgroundPosition: '0 0px'},
    {backgroundPosition: '0 -2100px'}
  ], {duration: 460, easing: 'steps(14, end)', iterations: Infinity});
};


/**
 * Creates a web Animation instance for the tool effect.
 * @return {Animation}
 * @private
 */
app.Clipper.prototype.shouldAnimate_ = function(mouse) {
  return mouse.down && mouse.x > 230 && game.hair.cloth.nearBeard;
};



/**
 * Hairgrow tool.
 * @constructor
 */
app.Hairgrow = function() {
  app.Tool.call(this, 'hairgrow', {x: 110, y: 25});
};
goog.inherits(app.Hairgrow, app.Tool);


/**
 * Creates a web animation for using the hairgrower.
 * @return {Animation}
 * @private
 */
app.Hairgrow.prototype.createAnimation_ = function() {
  return new Animation(this.animationEl[0], [
    {backgroundPosition: '0 350px'},
    {backgroundPosition: '0 -2450px'}
  ], {duration: 230, easing: 'steps(8, end)'});
};



/**
 * Hairclean tool.
 * @constructor
 */
app.Hairclean = function() {
  app.Tool.call(this, 'hairclean', {x: 120, y: 10});
};
goog.inherits(app.Hairclean, app.Tool);


/**
 * Creates a web animation for using the haircleaner.
 * @return {Animation}
 * @private
 */
app.Hairclean.prototype.createAnimation_ = function() {
  return new Animation(this.animationEl[0], [
    {backgroundPosition: '0 0px'},
    {backgroundPosition: '0 -2100px'}
  ], {duration: 460, easing: 'steps(14, end)', iterations: Infinity});
};



/**
 * Coloured spray tool
 * @constructor
 * @extends {app.Tool}
 * @param {string} name The name of the color.
 * @param {string} color The color in css hex.
 */
app.Spray = function(name, color) {
  app.Tool.call(this, 'spray--' + name, {x: 47, y: 0});

  this.color = color;
  this.spray = this.elem.find('#spray--' + name)[0];
};

app.Spray.prototype = Object.create(app.Tool.prototype);



/**
 * Decorations that stick on the beard
 * @constructor
 * @extends {app.Tool}
 * @param {string} name The name of the decoration
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {Image} decoration image.
 */
app.Decoration = function(name, offset, decoration) {
  app.Tool.call(this, 'decoration--' + name, offset);

  this.decoration = decoration;
};

app.Decoration.prototype = Object.create(app.Tool.prototype);



/**
 * The toolbox
 * @constructor
 */
app.Tools = function($elem) {
  app.Tool.prototype.elem = $elem;

  this.elem = $elem.find('.Tools');
  this.clipper = new app.Clipper();
  this.hairdryer = new app.Tool('hairdryer', {x: 100, y: 0});
  this.hairgrow = new app.Hairgrow();
  this.hairclean = new app.Hairclean();

  this.sprayRed = new app.Spray('red');
  this.sprayOrange = new app.Spray('orange');
  this.sprayYellow = new app.Spray('yellow');
  this.sprayGreen = new app.Spray('green');
  this.sprayCyan = new app.Spray('cyan');
  this.sprayPurple = new app.Spray('purple');
  this.sprayPink = new app.Spray('pink');
  this.sprayBlue = new app.Spray('blue');

  this.decorationSnowman = new app.Decoration('snowman', {x: 40, y: 50}, $elem.find('#snowman')[0]);
  this.decorationBauble = new app.Decoration('bauble', {x: 40, y: 50}, $elem.find('#bauble')[0]);
  this.decorationBow = new app.Decoration('bow', {x: 50, y: 45}, $elem.find('#bow')[0]);
  this.decorationHolly = new app.Decoration('holly', {x: 40, y: 45}, $elem.find('#holly')[0]);

  this.tools = [
    this.clipper,
    this.hairdryer,
    this.hairgrow,
    this.hairclean,

    this.sprayRed,
    this.sprayOrange,
    this.sprayYellow,
    this.sprayGreen,
    this.sprayCyan,
    this.sprayPurple,
    this.sprayPink,
    this.sprayBlue,

    this.decorationSnowman,
    this.decorationBauble,
    this.decorationBow,
    this.decorationHolly
  ];

  this.sprays = [
    this.sprayRed.spray,
    this.sprayOrange.spray,
    this.sprayYellow.spray,
    this.sprayGreen.spray,
    this.sprayCyan.spray,
    this.sprayPurple.spray,
    this.sprayPink.spray,
    this.sprayBlue.spray
  ];

  this.decorations = [
    this.decorationSnowman.decoration,
    this.decorationBauble.decoration,
    this.decorationBow.decoration,
    this.decorationHolly.decoration
  ];
};


/**
 * @extends {app.GameObject.start}
 */
app.Tools.prototype.start = function() {
  this.hairdryer.faceInward = function(mouse) {
    if (!this.isSelected) {
      return;
    }

    if (Math.abs(mouse.relX) <= 0.3) {
      this.el.addClass('Tool-hairdryer--center');
    } else {
      this.el.removeClass('Tool-hairdryer--center');
    }

    if (mouse.relX > 0.3) {
      this.el.addClass('Tool--right');
    } else {
      this.el.removeClass('Tool--right');
    }
  };

  var faceInward = function(mouse) {
    if (!this.isSelected) {
      return;
    }

    if (mouse.relX > 0) {
      this.el.addClass('Tool--right');
    } else {
      this.el.removeClass('Tool--right');
    }
  };

  game.mouse.subscribe(this.mouseChanged, this);

  if (!Modernizr.touch) {
    game.mouse.subscribe(this.hairdryer.faceInward, this.hairdryer);
    game.mouse.subscribe(faceInward, this.hairclean);
    game.mouse.subscribe(faceInward, this.hairgrow);
  }

  this.elem.on('click touchend', this.selectTool.bind(this));
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {app.Mouse} mouse
 */
app.Tools.prototype.mouseChanged = function(mouse) {
  if (this.selectedTool) {
    this.selectedTool.move(mouse);
  }

  if (game.tools.hairdryer.isSelected && mouse.down && mouse.x > 230) {
    app.utils.triggerStart('selfie_dryer');
  } else if (!mouse.down) {
    app.utils.triggerStop('selfie_dryer');
  }

  if (game.tools.clipper.isSelected && mouse.down && mouse.x > 230) {
    app.utils.triggerStart('selfie_shave');
  } else if (!mouse.down) {
    app.utils.triggerStop('selfie_shave');
  }

  if (game.tools.hairgrow.isSelected && mouse.down && mouse.x > 230) {
    app.utils.triggerOnce('selfie_spray_small');
  } else if (!mouse.down) {
    app.utils.triggerReset('selfie_spray_small');
  }

  if (game.tools.hairclean.isSelected && mouse.down && mouse.x > 230) {
    app.utils.triggerOnce('selfie_spray_big');
  } else if (!mouse.down) {
    app.utils.triggerReset('selfie_spray_big');
  }
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {Event} e DOM click event
 */
app.Tools.prototype.selectTool = function(e) {
  var previousTool = this.selectedTool;

  this.selectedTool = this.tools.filter(function(tool) {
    if (tool.container[0] === e.target && !tool.isSelected) {
      return tool;
    }
  })[0];

  if (this.selectedTool) {
    this.selectedTool.select();
  }

  if (previousTool) {
    previousTool.deselect();
  }
};
