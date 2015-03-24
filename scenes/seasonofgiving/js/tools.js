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

goog.require('app.CustomSlider');
goog.require('app.GameManager');

goog.provide('app.Tools');

/**
 * Tool wrapper
 * @constructor
 * @param {jQuery} el element of wrapper
 */
app.ToolWrapper = function(el) {
  this.el = el;
};

/**
 * Collapse animation
 */
app.ToolWrapper.prototype.collapse = function() {
  this.el[0].animate([
    {'height': '562px'},
    {'height': '165px'},
    {'height': '208px'},
    {'height': '193px'},
    {'height': '198px'}
  ], {
    fill: 'forwards',
    delay: 200,
    duration: 400,
    ease: 'ease'
  });
};

/**
 * Expand animation
 */
app.ToolWrapper.prototype.expand = function() {
  this.el[0].animate([
    {'height': '198px'},
    {'height': '587px'},
    {'height': '552px'},
    {'height': '567px'},
    {'height': '562px'}
  ], {
    fill: 'forwards',
    duration: 450,
    ease: 'ease'
  });
};

/**
 * Button
 * @constructor
 * @param {string} name Name of element
 * @param {string} el Context scope
 * @return {!Element} Button element
 */
app.Button = function(name, el) {
  this.el = el.find('.Button-' + name);
  return this.el;
};

/**
 * Base tool item
 * @constructor
 * @extends {app.GameObject}
 * @param {!app.Game} game The game object.
 * @param {string} name The name of the tool. Element should have class Tool-name.
 * @param {{x: number, y: number}} mouseOffset Mouse interaction offset
 */
app.Tool = function(game, name, mouseOffset) {
  this.game = game;
  this.el = this.elem.find('.Tool-' + name);
  this.container = this.el.closest('.Tool-container');
  this.isSelected = false;
  this.color = this.el.data('color');
  this.height = this.el.height();
  this.width = this.el.width();
  this.mouseOffset = mouseOffset || {x: 0, y: 0};

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
};

/**
 * Select this tool from the toolbox
 */
app.Tool.prototype.select = function() {
  var endScale = (app.GameManager.sizeSlider.strokeSize * .1 * .1) * 2 + .2;
  this.isSelected = true;
  this.el.addClass('Tool--selected');
  this.width = this.el.width();
  this.elem.find('.canvas').addClass('canvas--active');
  this.bounceTo(endScale);
  this.move(this.game.mouse);
  Klang.triggerEvent('spirit_click');
};

/**
 * Bounce to animation
 * @param {number} value 0.1-1.0 scale to bounce to
 */
app.Tool.prototype.bounceTo = function(value) {
  var bounce = [
    {transform: animScale(.3, value)},
    {transform: animScale(1.2, value)},
    {transform: animScale(.9, value)},
    {transform: animScale(1.03, value)},
    {transform: animScale(.97, value)},
    {transform: animScale(1, value)}
  ];

  var animProps = {
    fill: 'forwards',
    duration: 500,
    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
  };

  this.el[0].animate(bounce, animProps);

  function animScale(to, end) {
    return 'scale3d(' + (to * end) + ',' + (to * end) + ',' + (to * end) + ')';
  }
};

/**
 * Deselect this tool
 */
app.Tool.prototype.deselect = function() {
  this.isSelected = false;
  this.bounceTo(1);
  this.el.removeClass('Tool--selected');
  this.el.css({
    top: '',
    left: '',
    transform: ''
  });
  this.elem.find('.canvas').removeClass('canvas--active');

  app.GameManager.tool = null;
};

/**
 * @param {!app.Mouse} mouse
 */
app.Tool.prototype.move = function(mouse) {
  var offsetX = this.mouseOffset.x;

   this.el.css({
    left: mouse.x - offsetX,
    top: mouse.y - this.height - 100
  });
};

/**
 * Resize Tool item
 */
app.Tool.prototype.resize = function() {
  this.el.css({
    'height': $(window).width() / 7,
    'width': $(window).width() / 7
  });
};

/**
 * Tool
 * @constructor
 * @param {!app.Game} game The game object.
 * @param {!Element} elem DOM Element for Tool
 * @param {!Object} exporter Exported object for print and download
 */
app.Tools = function(game, elem, exporter) {
  app.Tool.prototype.elem = elem;
  this.game = game;
  var crayonOffset = {x: 10, y: 20};
  this.context = elem;
  this.elem = elem.find('.Tools');
  this.crayonRed = new app.Tool(this.game, 'crayon--red', crayonOffset);
  this.crayonOrange = new app.Tool(this.game, 'crayon--orange', crayonOffset);
  this.crayonYellow = new app.Tool(this.game, 'crayon--yellow', crayonOffset);
  this.crayonLightGreen = new app.Tool(this.game, 'crayon--light-green', crayonOffset);
  this.crayonGreen = new app.Tool(this.game, 'crayon--green', crayonOffset);
  this.crayonLightBlue = new app.Tool(this.game, 'crayon--light-blue', crayonOffset);
  this.crayonBlue = new app.Tool(this.game, 'crayon--blue', crayonOffset);
  this.crayonViolet = new app.Tool(this.game, 'crayon--violet', crayonOffset);
  this.crayonPurple = new app.Tool(this.game, 'crayon--purple', crayonOffset);
  this.crayonRainbow = new app.Tool(this.game, 'crayon--rainbow', crayonOffset);
  this.crayonBrown = new app.Tool(this.game, 'crayon--brown', crayonOffset);
  this.eraser = new app.Tool(this.game, 'crayon--eraser', {x: 50, y: 0});

  this.sizeSlider = new app.CustomSlider(this.context);

  this.exporter = exporter;

  this.print = new app.Button('print', this.context);
  // Needs click in FF for popup
  this.print.on('click', this.onClickPrint.bind(this));

  this.download = new app.Button('download', this.context);
  // Needs click in FF for popup
  this.download.on('click', this.onClickDownload.bind(this));

  this.clearOrnament = new app.Button('reset', this.context);
  this.clearOrnament.on('touchstart mousedown', this.onClickReset.bind(this));

  this.downloadMobile = new app.Button('download--mobile', this.context);
  this.downloadMobile.parent().on('touchstart mousedown', this.onClickDownload.bind(this));

  this.resetMobile = new app.Button('reset--mobile', this.context);
  this.resetMobile.parent().on('touchstart mousedown', this.onClickReset.bind(this));

  this.toolWrapper = new app.ToolWrapper(this.context.find('.Tool-wrapper'));
  app.GameManager.toolWrapper = this.toolWrapper;

  this.buttons = this.context.find('.Buttons');

  this.tools = [
    this.crayonRed,
    this.crayonOrange,
    this.crayonYellow,
    this.crayonLightGreen,
    this.crayonGreen,
    this.crayonLightBlue,
    this.crayonBlue,
    this.crayonViolet,
    this.crayonPurple,
    this.crayonBrown,
    this.crayonRainbow,
    this.eraser
  ];

  $(window).on('resize.seasonofgiving', this.handleResize.bind(this));
  this.handleResize();
};

/**
 * Resize
 */
app.Tools.prototype.handleResize = function() {
  var wh = $(window).height();
  var maxToolHeight = this.elem.height();
  var cols;

  if ($(window).width() > 1024) {
    this.elem.css({
      'height': wh - 198 - 204 - 70
    });

    this.elem.find('.Tool-container').css({
      'height': '70px',
      'width': '33.3%'
    });
  } else {
    if ($(window).width() > 550) {
      cols = 14;
    } else {
      cols = 7;
    }

    var toolContainerSize = $(window).width() / cols - 10;
    this.elem.find('.Tool-container').css({
      'height': toolContainerSize,
      'width': toolContainerSize
    });

    this.elem.css('height', 'auto');

    app.GameManager.mobileSlider.updateExpandOffset(toolContainerSize, cols);
  }

  this.buttons.css({
    'left': this.toolWrapper.el[0].offsetLeft,
    'top': this.toolWrapper.el.height() + 10
  });
};

/**
 * @extends {app.GameObject.start}
 */
app.Tools.prototype.start = function() {
  this.game.mouse.subscribe(this.mouseChanged, this);
  this.elem.on('click touchend', this.selectTool.bind(this));
};

/**
 * @extends {app.GameObject.mouseChanged}
 * @param {!app.Mouse} mouse
 */
app.Tools.prototype.mouseChanged = function(mouse) {
  if (this.selectedTool) {
    this.selectedTool.move(mouse);
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

  if (previousTool) {
    previousTool.deselect();
  }

  if (this.selectedTool) {
    app.GameManager.tool = this.selectedTool;
    this.selectedTool.select();
    if (typeof this.selectedTool.color !== undefined) {
      app.GameManager.color = this.selectedTool.color;
    }
  }
};

/**
 * Clear ornament stage
 * @param {Event} event Event for click reset
 */
app.Tools.prototype.onClickReset = function(event) {
  if (app.GameManager.lastOrnamentObj) {
    app.GameManager.lastOrnamentObj.reset();
  }
};

/**
 * Print ornament stage
 * @param {Event} event Event for click print
 */
app.Tools.prototype.onClickPrint = function(event) {
  if (app.GameManager.lastOrnamentObj) {
    this.exporter.print(app.GameManager.lastOrnamentObj);
  }
};

/**
 * Download ornament stage
 * @param {Event} event Event for click download
 */
app.Tools.prototype.onClickDownload = function(event) {
  if (app.GameManager.lastOrnamentObj) {
    this.exporter.download(app.GameManager.lastOrnamentObj);
  }
};
