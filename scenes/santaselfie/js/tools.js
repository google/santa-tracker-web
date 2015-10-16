/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Tools');

goog.require('app.utils');



/**
 * Base tool item
 * @constructor
 * @extends {!app.GameObject}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 * Element should have class Tool-name.
 * @param {{x: number, y: number}} mouseOffset Tool offset relative to the mouse
 */
app.Tool = function($elem, name, mouseOffset) {
  this.elem = $elem;
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
 * @param {!app.Mouse.CoordsType} mouseCoords at selection time
 */
app.Tool.prototype.select = function(mouseCoords) {
  this.isSelected = true;

  this.el.addClass('Tool--selected');
  this.width = this.el.width();

  if (Modernizr.touch) {
    this.elem.css({ 'background-size': 0 }); // Hide tool on touch devices
  } else {
    this.elem.css({ cursor: 'none' });
  }

  this.move(mouseCoords);
  window.santaApp.fire('sound-trigger', 'selfie_click');
};


/**
 * Deselect this tool
 */
app.Tool.prototype.deselect = function() {
  this.isSelected = false;

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
 * @private
 * @return {boolean} whether this tool orients both left and right
 */
app.Tool.prototype.isLeftRightTool_ = function() {
  return false;
};


/**
 * Move the tool to the specified mouse position
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tool.prototype.move = function(mouseCoords) {
  var offsetX = this.mouseOffset.x;

  if (mouseCoords.relX > 0 && this.isLeftRightTool_()) {
    offsetX = this.width - this.mouseOffset.x;
  }

  this.el.css({
    left: mouseCoords.x - (offsetX * mouseCoords.scale),
    top: mouseCoords.y - (this.mouseOffset.y * mouseCoords.scale)
  });

  var shouldAnimate = this.shouldAnimate_(mouseCoords);
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
 * @return {AnimationEffectReadOnly}
 * @private
 */
app.Tool.prototype.createAnimation_ = function() {
  return null;
};


/**
 * Evaluate if the tool should play its animation. Should be overwritten if
 * relevant.
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 * @return {boolean}
 * @private
 */
app.Tool.prototype.shouldAnimate_ = function(mouseCoords) {
  return this.animationPlayer && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM;
};



/**
 * Clipper tool.
 * @param {!jQuery} $elem toolbox elem
 * @param {!app.Cloth} cloth of Santa's hair
 * @constructor
 */
app.Clipper = function($elem, cloth) {
  app.Tool.call(this, $elem, 'clipper', {x: 40, y: 0});
  this.cloth_ = cloth;
};
goog.inherits(app.Clipper, app.Tool);


/**
 * Creates a web animation for using the clippers.
 * @return {AnimationEffectReadOnly}
 * @private
 */
app.Clipper.prototype.createAnimation_ = function() {
  return new KeyframeEffect(this.animationEl[0], [
    {backgroundPosition: '0 0px'},
    {backgroundPosition: '0 -2100px'}
  ], {duration: 460, easing: 'steps(14, end)', iterations: Infinity});
};


/**
 * Evaluate whether the Clipper should play its animation.
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 * @return {boolean}
 * @private
 */
app.Clipper.prototype.shouldAnimate_ = function(mouseCoords) {
  return mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM && this.cloth_.nearBeard;
};

/**
 * @extends {app.Tool.select}
 */
app.Clipper.prototype.select = function(mouseCoords) {
  app.Tool.prototype.select.call(this, mouseCoords);
  window.santaApp.fire('sound-trigger', 'selfie_concerned');
};

/**
 * @extends {app.Tool.deselect}
 */
app.Clipper.prototype.deselect = function() {
  app.Tool.prototype.deselect.call(this);
  window.santaApp.fire('sound-trigger', 'selfie_happy');
};

/**
 * Hairgrow tool.
 * @param {!jQuery} $elem toolbox elem
 * @constructor
 */
app.Hairgrow = function($elem) {
  app.Tool.call(this, $elem, 'hairgrow', {x: 110, y: 25});
};
goog.inherits(app.Hairgrow, app.Tool);


/**
 * Creates a web animation for using the hairgrower.
 * @return {AnimationEffectReadOnly}
 * @private
 */
app.Hairgrow.prototype.createAnimation_ = function() {
  return new KeyframeEffect(this.animationEl[0], [
    {backgroundPosition: '0 350px'},
    {backgroundPosition: '0 -2450px'}
  ], {duration: 230, easing: 'steps(8, end)'});
};

/**
 * @extends {app.Tool.isLeftRightTool_}
 */
app.Hairgrow.prototype.isLeftRightTool_ = function() {
  return true;
};

/**
 * Hairclean tool.
 * @param {!jQuery} $elem toolbox elem
 * @constructor
 */
app.Hairclean = function($elem) {
  app.Tool.call(this, $elem, 'hairclean', {x: 120, y: 10});
};
goog.inherits(app.Hairclean, app.Tool);


/**
 * Creates a web animation for using the haircleaner.
 * @return {AnimationEffectReadOnly}
 * @private
 */
app.Hairclean.prototype.createAnimation_ = function() {
  return new KeyframeEffect(this.animationEl[0], [
    {backgroundPosition: '0 0px'},
    {backgroundPosition: '0 -2100px'}
  ], {duration: 460, easing: 'steps(14, end)', iterations: Infinity});
};

/**
 * @extends {app.Tool.isLeftRightTool_}
 */
app.Hairclean.prototype.isLeftRightTool_ = function() {
  return true;
};


/**
 * Coloured spray tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 * @param {string} color The color in css hex.
 */
app.Spray = function($elem, name, color) {
  app.Tool.call(this, $elem, 'spray--' + name, {x: 47, y: 0});

  this.color = color;
  this.spray = this.elem.find('#spray--' + name)[0];
};
app.Spray.prototype = Object.create(app.Tool.prototype);



/**
 * Decorations that stick on the beard
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the decoration
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {!Image} decoration image.
 */
app.Decoration = function($elem, name, offset, decoration) {
  app.Tool.call(this, $elem, 'decoration--' + name, offset);

  this.decoration = decoration;
};
app.Decoration.prototype = Object.create(app.Tool.prototype);



/**
 * The toolbox
 * @param {!app.Game} game
 * @param {!jQuery} $elem
 * @constructor
 */
app.Tools = function(game, $elem) {
  this.game_ = game;

  this.elem = $elem.find('.Tools');
  this.clipper = new app.Clipper($elem, game.cloth);
  this.hairdryer = new app.Tool($elem, 'hairdryer', {x: 100, y: 0});
  this.hairgrow = new app.Hairgrow($elem);
  this.hairclean = new app.Hairclean($elem);

  this.sprayRed = new app.Spray($elem, 'red');
  this.sprayOrange = new app.Spray($elem, 'orange');
  this.sprayYellow = new app.Spray($elem, 'yellow');
  this.sprayGreen = new app.Spray($elem, 'green');
  this.sprayCyan = new app.Spray($elem, 'cyan');
  this.sprayPurple = new app.Spray($elem, 'purple');
  this.sprayPink = new app.Spray($elem, 'pink');
  this.sprayBlue = new app.Spray($elem, 'blue');

  this.decorationSnowman = new app.Decoration($elem, 'snowman', {x: 40, y: 50}, $elem.find('#snowman')[0]);
  this.decorationBauble = new app.Decoration($elem, 'bauble', {x: 40, y: 50}, $elem.find('#bauble')[0]);
  this.decorationBow = new app.Decoration($elem, 'bow', {x: 50, y: 45}, $elem.find('#bow')[0]);
  this.decorationHolly = new app.Decoration($elem, 'holly', {x: 40, y: 45}, $elem.find('#holly')[0]);

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
  this.selectTool_ = this.selectTool_.bind(this);
  this.elem.on('click touchend', this.selectTool_);

  var hairdryerFaceInward = faceInward = function(mouse, mouseCoords) {
    if (!this.isSelected) {
      return;
    }

    if (Math.abs(mouseCoords.relX) <= 0.3) {
      this.el.addClass('Tool-hairdryer--center');
    } else {
      this.el.removeClass('Tool-hairdryer--center');
    }

    if(mouseCoords.relX < -0.3) {
      this.el.addClass('Tool--left');
    } else {
      this.el.removeClass('Tool--left');
    }

    if (mouseCoords.relX > 0.3) {
      this.el.addClass('Tool--right');
    } else {
      this.el.removeClass('Tool--right');
    }
  };

  var faceInward = function(mouse, mouseCoords) {
    if (!this.isSelected) {
      return;
    }

    if (mouseCoords.relX > 0) {
      this.el.addClass('Tool--right');
      this.el.removeClass('Tool--left');
    } else {
      this.el.addClass('Tool--left');
      this.el.removeClass('Tool--right');
    }
  };

  var mouse = this.game_.mouse;
  mouse.subscribe(hairdryerFaceInward, this.hairdryer);
  mouse.subscribe(faceInward, this.hairclean);
  mouse.subscribe(faceInward, this.hairgrow);
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {!app.Mouse} mouse
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tools.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (this.selectedTool) {
    this.selectedTool.move(mouseCoords);
  }

  if (this.hairdryer.isSelected && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM) {
    app.utils.triggerStart('selfie_dryer');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_dryer');
  }

  if (this.clipper.isSelected && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM) {
    app.utils.triggerStart('selfie_shave');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_shave');
  }

  if (this.hairgrow.isSelected && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM) {
    app.utils.triggerOnce('selfie_spray_small');
  } else if (!mouseCoords.down) {
    app.utils.triggerReset('selfie_spray_small');
  }

  if (this.hairclean.isSelected && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM) {
    app.utils.triggerOnce('selfie_spray_big');
  } else if (!mouseCoords.down) {
    app.utils.triggerReset('selfie_spray_big');
  }
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {!Event} e DOM click event
 * @private
 */
app.Tools.prototype.selectTool_ = function(e) {
  var previousTool = this.selectedTool;

  this.selectedTool = this.tools.filter(function(tool) {
    if (tool.container[0] === e.target && !tool.isSelected) {
      return tool;
    }
  })[0];

  if (this.selectedTool) {
    var coords = this.game_.mouse.coordinates();
    this.selectedTool.select(coords);
  }

  if (previousTool) {
    previousTool.deselect();
  }
};
