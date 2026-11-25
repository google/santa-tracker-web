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
goog.require('app.ColorPicker');
goog.require('app.Constants');
goog.require('app.shared.utils');
goog.require('app.utils');

const inherits = function(c, p) {
  c.prototype = Object.create(p.prototype);
  c.prototype.constructor = c;
  Object.setPrototypeOf(c, p);
};

/**
 * Base tool item
 * @constructor
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

  this.initAnimation_();
};


/**
 * Select this tool from the toolbox
 * @param {!app.Mouse.CoordsType} mouseCoords at selection time
 */
app.Tool.prototype.select = function(mouseCoords) {
  this.isSelected = true;

  // Attach to the main board so the floating tool remains visible across any active tab
  this.elem.append(this.el);
  this.el.addClass('Tool--selected');
  this.width = this.el.width();

  if (app.shared.utils.touchEnabled) {
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

  this.el.removeClass('Tool--selected Tool--left Tool--right Tool-hairdryer--center');
  this.el.css({
    top: '',
    left: ''
  });
  // Restore element into its original wardrobe container slot
  this.container.append(this.el);
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
    top: mouseCoords.y - (this.mouseOffset.y * mouseCoords.scale) + window.santaApp.headerSize,
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
  if (this.animationPlayer) {
    return mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM;
  }
  return false;
};



/**
 * Clipper tool.
 * @param {!jQuery} $elem toolbox elem
 * @param {!app.Cloth} cloth of Santa's hair
 * @constructor
 * @extends {app.Tool}
 */
app.Clipper = function($elem, cloth) {
  app.Tool.call(this, $elem, 'clipper', {x: 40, y: 0});
  this.cloth_ = cloth;
};
inherits(app.Clipper, app.Tool);


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
 */
app.Clipper.prototype.select = function(mouseCoords) {
  app.Tool.prototype.select.call(this, mouseCoords);
  window.santaApp.fire('sound-trigger', 'selfie_concerned');
};

/**
 */
app.Clipper.prototype.deselect = function() {
  app.Tool.prototype.deselect.call(this);
  window.santaApp.fire('sound-trigger', 'selfie_happy');
};

/**
 * Hairgrow tool.
 * @param {!jQuery} $elem toolbox elem
 * @constructor
 * @extends {app.Tool}
 */
app.Hairgrow = function($elem) {
  app.Tool.call(this, $elem, 'hairgrow', {x: 110, y: 25});
};
inherits(app.Hairgrow, app.Tool);


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
 */
app.Hairgrow.prototype.isLeftRightTool_ = function() {
  return true;
};

/**
 * Hairclean tool.
 * @param {!jQuery} $elem toolbox elem
 * @constructor
 * @extends {app.Tool}
 */
app.Hairclean = function($elem) {
  app.Tool.call(this, $elem, 'hairclean', {x: 120, y: 10});
};
inherits(app.Hairclean, app.Tool);


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
 */
app.Spray = function($elem, name) {
  app.Tool.call(this, $elem, 'spray--' + name, {x: 47, y: 0});

  // This is a hidden image on the page that's used by the canvas
  this.spray = this.elem.find('#spray--' + name)[0];
};
app.Spray.prototype = Object.create(app.Tool.prototype);



/**
 * Spray whose colour the player picks from a popup that opens when the spray is picked up.
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {function(string): void} onPick called with the picked colour as rrggbb
 */
app.CustomSpray = function($elem, onPick) {
  app.Tool.call(this, $elem, 'spray--custom', {x: 47, y: 0});

  this.picker = new app.ColorPicker($elem, onPick);

  /** @type {?HTMLCanvasElement} What the canvas paints on the beard; see setSpray. */
  this.spray = null;
};
app.CustomSpray.prototype = Object.create(app.Tool.prototype);


/**
 * @param {!app.Mouse.CoordsType} mouseCoords at selection time
 * @override
 */
app.CustomSpray.prototype.select = function(mouseCoords) {
  app.Tool.prototype.select.call(this, mouseCoords);
  this.picker.open();
};


/**
 * @override
 */
app.CustomSpray.prototype.deselect = function() {
  app.Tool.prototype.deselect.call(this);
  this.picker.close();
};


/**
 * @param {!HTMLCanvasElement} spray image to paint with
 * @param {string} color its colour as rrggbb, shown on the bottle
 */
app.CustomSpray.prototype.setSpray = function(spray, color) {
  this.spray = spray;
  // On the container too: the bottle stays in the wardrobe while the spray is in use, as the
  // button that opens the colour picker.
  this.el.add(this.container).css('background-image',
      'url("data:image/svg+xml,' + encodeURIComponent(app.CustomSpray.bottleSvg_(color)) + '")');
};


/**
 * The rainbow spray bottle, with the loaded colour shown on its label.
 * @param {string} color rrggbb
 * @return {string} SVG source
 * @private
 */
app.CustomSpray.bottleSvg_ = function(color) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 93 196">' +
      '<g opacity=".25"><path d="M45 16.6h5v12.7h-5z"/><path d="M30.2 23h34.7v13.9H30.2z"/>' +
      '<path d="M61.2 28H33c-8.3 0-15.8 4.1-20.5 10.9-5.2 7.5-8 16.7-7.4 26.6 1.2 21.7 19 39.2 40.7 40C70 106.4 90 87 90 63c0-8.6-2.6-16.7-7-23.4C78.3 32.5 69.8 28 61.2 28z"/>' +
      '<path d="M5 50h85v143.4H5z"/><path d="M2.1 48.1H93V52H2.1z"/><path d="M2.1 191H92v4.9H2.1z"/><path d="M39 2h17v19H39z"/></g>' +
      '<path fill="#546E7A" d="M43 14.6h5v12.7h-5z"/><path fill="#546E7A" d="M37 0h17v19H37z"/>' +
      '<path fill="#373D40" d="M28.2 21h34.7v13.9H28.2z"/>' +
      '<path fill="#8B8B8B" d="M59.2 26H31c-8.3 0-15.8 4.1-20.5 10.9-5.2 7.5-8 16.7-7.4 26.6 1.2 21.7 19 39.2 40.7 40C68 104.4 88 85 88 61c0-8.6-2.6-16.7-7-23.4C76.3 30.5 67.8 26 59.2 26z"/>' +
      '<path fill="#E53935" d="M3 48h85v24H3z"/><path fill="#FB8C00" d="M3 72h85v24H3z"/>' +
      '<path fill="#FDD835" d="M3 96h85v24H3z"/><path fill="#43A047" d="M3 120h85v24H3z"/>' +
      '<path fill="#1E88E5" d="M3 144h85v24H3z"/><path fill="#8E24AA" d="M3 168h85v23.4H3z"/>' +
      '<path opacity=".2" fill="#1A242A" d="M52.1 48H88v143.4H52.1z"/>' +
      '<path fill="#373D40" d="M.1 46.1H91V50H.1z"/><path fill="#373D40" d="M.1 189H90v4.9H.1z"/>' +
      '<circle fill="#fff" cx="45.1" cy="116.6" r="27"/>' +
      '<circle fill="#' + color + '" stroke="#373D40" stroke-width="2" cx="45.1" cy="116.6" r="20"/>' +
      '</svg>';
};



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
  this.sprayCustom = new app.CustomSpray($elem, this.pickCustomColor.bind(this));
  this.sprayWhiteDots = new app.Spray($elem, 'whitedots');
  this.sprayWhiteDots.isPattern = true;
  this.sprayWhiteDots.patternType = 'dots';

  this.sprayWave = new app.Spray($elem, 'wave');
  this.sprayWave.isPattern = true;
  this.sprayWave.patternType = 'wave';

  this.sprayTriangle = new app.Spray($elem, 'triangle');
  this.sprayTriangle.isPattern = true;
  this.sprayTriangle.patternType = 'triangle';

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
    this.sprayCustom,
    this.sprayWhiteDots,
    this.sprayWave,
    this.sprayTriangle,

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

  // The colours picked for the custom spray. Each has a spray image of its own, so hair painted
  // earlier keeps its colour, and a saved beard refers to them by position in these lists.
  /** @type {!Array<!HTMLCanvasElement>} */
  this.customSprays = [];
  /** @private {!Array<string>} */
  this.customColors_ = [];
  /** @private {number} */
  this.customReplaceIndex_ = 0;
  this.pickCustomColor(app.Constants.DEFAULT_CUSTOM_COLOR);

  this.patterns = [
    this.sprayWhiteDots.spray,
    this.sprayWave.spray,
    this.sprayTriangle.spray
  ];

  this.decorations = [
    this.decorationSnowman.decoration,
    this.decorationBauble.decoration,
    this.decorationBow.decoration,
    this.decorationHolly.decoration
  ];

  $elem.find('.Tools-tabs').on('click touchend', '.Tools-tab', (e) => {
    this.switchTab(String($(e.currentTarget).data('tab')));
  });
};


/**
 * Loads a colour into the custom spray.
 * @param {string} color rrggbb
 */
app.Tools.prototype.pickCustomColor = function(color) {
  var slot = this.customColors_.indexOf(color);

  if (slot === -1) {
    if (this.customSprays.length < app.Constants.MAX_CUSTOM_SPRAYS) {
      slot = this.customSprays.push(app.Tools.createCanvas_()) - 1;
    } else {
      // Every slot is taken. Reuse one whose colour is no longer on the beard; if they all are,
      // the oldest is recoloured, and the hair painted with it changes colour too.
      var points = this.game_.cloth.points;
      slot = this.customSprays.findIndex(function(spray) {
        return !points.some(function(point) {
          return point.draw && point.spray === spray;
        });
      });
      if (slot === -1) {
        slot = this.customReplaceIndex_++ % app.Constants.MAX_CUSTOM_SPRAYS;
      }
    }
    this.setCustomColor_(slot, color);
  }

  this.sprayCustom.setSpray(this.customSprays[slot], color);
  this.sprayCustom.picker.close();
};


/**
 * @return {!HTMLCanvasElement}
 * @private
 */
app.Tools.createCanvas_ = function() {
  return /** @type {!HTMLCanvasElement} */ (document.createElement('canvas'));
};


/**
 * @param {number} slot position in customSprays, which must exist
 * @param {string} color rrggbb
 * @private
 */
app.Tools.prototype.setCustomColor_ = function(slot, color) {
  var canvas = this.customSprays[slot];
  canvas.width = canvas.height = 128;  // also clears a canvas that is being reused

  var ctx = canvas.getContext('2d');
  var rgb = [0, 2, 4].map(function(i) {
    return parseInt(color.substr(i, 2), 16);
  }).join(',');
  var gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

  // The same soft falloff as the spray images of the fixed colours.
  [0.94, 0.87, 0.74, 0.54, 0.31, 0.15, 0.07, 0.03, 0].forEach(function(alpha, i) {
    gradient.addColorStop(i / 8, 'rgba(' + rgb + ',' + alpha + ')');
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  this.customColors_[slot] = color;
};


/**
 * @return {string} the custom colours a saved beard needs, joined with dots; empty if none
 */
app.Tools.prototype.customColors = function() {
  var customSprays = this.customSprays;
  var lastUsed = -1;

  this.game_.cloth.points.forEach(function(point) {
    if (point.draw) {
      lastUsed = Math.max(lastUsed, customSprays.indexOf(point.spray));
    }
  });

  return this.customColors_.slice(0, lastUsed + 1).join('.');
};


/**
 * Replaces the custom colours with those of a saved beard.
 * @param {string} colors as returned by customColors
 */
app.Tools.prototype.setCustomColors = function(colors) {
  if (!/^[0-9a-f]{6}(\.[0-9a-f]{6})*$/.test(colors)) {
    console.error('[SantaSelfie] Ignoring custom colours that are not rrggbb: ' + colors);
    return;
  }

  colors.split('.').slice(0, app.Constants.MAX_CUSTOM_SPRAYS).forEach(function(color, slot) {
    this.customSprays[slot] = this.customSprays[slot] || app.Tools.createCanvas_();
    this.setCustomColor_(slot, color);
  }, this);

  // Slot 0 held the starting colour and has just been recoloured, so show that on the bottle.
  this.sprayCustom.setSpray(this.customSprays[0], this.customColors_[0]);
};


/**
 * @return {!Array<!HTMLImageElement|!HTMLCanvasElement>} fixed colours, then custom ones
 */
app.Tools.prototype.allSprays = function() {
  return this.sprays.concat(this.customSprays);
};


/**
 * Switch active wardrobe tab and page.
 * @param {string} tabName
 */
app.Tools.prototype.switchTab = function(tabName) {
  this.elem.find('.Tools-tab').removeClass('is-active');
  this.elem.find('.Tools-tab--' + tabName).addClass('is-active');

  this.elem.find('.Tools-page').removeClass('is-active');
  this.elem.find('.Tools-page--' + tabName).addClass('is-active');
};


/**
 */
app.Tools.prototype.start = function() {
  this.selectTool_ = this.selectTool_.bind(this);
  this.elem.on('click touchend', this.selectTool_);

  var hairdryerFaceInward = function(mouse, mouseCoords) {
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
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tools.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (this.selectedTool) {
    this.selectedTool.move(mouseCoords);
  }

  // Starting to paint without picking keeps the current colour.
  if (mouseCoords.down && this.sprayCustom.picker.isOpen) {
    this.sprayCustom.picker.close();
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
 * Deselect all tools.
 */
app.Tools.prototype.deselect = function() {
  if (this.selectedTool) {
    this.selectedTool.deselect();
  }
  this.selectedTool = null;
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {!Event} e DOM click event
 * @private
 */
app.Tools.prototype.selectTool_ = function(e) {
  // Pressing the custom spray's bottle while the spray is in use brings the colour picker back.
  // With the picker already open it puts the spray down, like any other tool.
  if (this.sprayCustom.isSelected && !this.sprayCustom.picker.isOpen &&
      $(e.target).closest(this.sprayCustom.container).length) {
    this.sprayCustom.picker.open();
    return;
  }
  var previousTool = this.selectedTool;

  this.selectedTool = this.tools.filter(function(tool) {
    if ($(e.target).closest(tool.container).length && !tool.isSelected) {
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
